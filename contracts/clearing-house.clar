;; Apex Protocol - Clearing House
;; Core contract: opens/closes leveraged positions, tracks P&L, manages open interest

(define-constant CONTRACT-OWNER tx-sender)
(define-constant STX-ASSET-ID u1)
(define-constant SBTC-ASSET-ID u2)
(define-constant BASIS-POINTS u10000)
(define-constant DEFAULT-MAINTENANCE-MARGIN u500) ;; 5% in basis points

(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-MARKET-NOT-FOUND (err u201))
(define-constant ERR-MARKET-INACTIVE (err u202))
(define-constant ERR-POSITION-EXISTS (err u203))
(define-constant ERR-NO-POSITION (err u204))
(define-constant ERR-INSUFFICIENT-MARGIN (err u205))
(define-constant ERR-INVALID-SIZE (err u206))
(define-constant ERR-LEVERAGE-EXCEEDED (err u207))
(define-constant ERR-STALE-PRICE (err u208))
(define-constant ERR-TRANSFER-FAILED (err u209))

;; Market configuration
(define-map markets
  { market-id: uint }
  { base-asset-id: uint,
    quote-asset-id: uint,
    is-active: bool,
    max-leverage: uint,
    maintenance-margin-rate: uint,
    open-interest-long: uint,
    open-interest-short: uint,
    created-at: uint })

;; User positions
(define-map positions
  { user: principal, market-id: uint }
  { size: uint,
    is-long: bool,
    entry-price: uint,
    margin: uint,
    collateral-asset-id: uint,
    entry-funding-rate: int,
    last-updated: uint })

(define-data-var owner principal CONTRACT-OWNER)
(define-data-var oracle-contract principal CONTRACT-OWNER)
(define-data-var margin-contract principal CONTRACT-OWNER)
(define-data-var funding-contract principal CONTRACT-OWNER)
(define-data-var liquidation-contract principal CONTRACT-OWNER)
(define-data-var next-market-id uint u1)

;; Read-only functions

(define-read-only (get-market (market-id uint))
  (map-get? markets { market-id: market-id }))

(define-read-only (get-position (user principal) (market-id uint))
  (map-get? positions { user: user, market-id: market-id }))

(define-read-only (has-position (user principal) (market-id uint))
  (is-some (map-get? positions { user: user, market-id: market-id })))

(define-read-only (get-position-value (user principal) (market-id uint))
  (match (map-get? positions { user: user, market-id: market-id })
    pos
    (match (contract-call? (var-get oracle-contract) get-price (get base-asset-id (unwrap-panic (map-get? markets { market-id: market-id }))))
      price-data (ok (* (get size pos) (get price price-data)))
      err-code (err err-code))
    ERR-NO-POSITION))

(define-read-only (get-unrealized-pnl (user principal) (market-id uint))
  (match (map-get? positions { user: user, market-id: market-id })
    pos
    (match (contract-call? (var-get oracle-contract) get-price (get base-asset-id (unwrap-panic (map-get? markets { market-id: market-id }))))
      price-data
      (let* ((current-price (get price price-data))
             (entry-price (get entry-price pos))
             (size (get size pos))
             (price-delta (if (get is-long pos)
                            (to-int (- current-price entry-price))
                            (to-int (- entry-price current-price))))
             (raw-pnl (* price-delta (to-int size))))
        (ok raw-pnl))
      err-code (err err-code))
    ERR-NO-POSITION))

(define-read-only (get-margin-ratio (user principal) (market-id uint))
  (match (map-get? positions { user: user, market-id: market-id })
    pos
    (match (get-unrealized-pnl user market-id)
      pnl
      (let* ((margin (to-int (get margin pos)))
             (effective-margin (+ margin pnl))
             (notional (to-int (* (get size pos) (get entry-price pos)))))
        (if (> notional i0)
          (ok (/ (* effective-margin (to-int BASIS-POINTS)) notional))
          ERR-NO-POSITION))
      err-code (err err-code))
    ERR-NO-POSITION))

;; Admin functions

(define-public (create-market (base-asset-id uint) (quote-asset-id uint) (max-leverage uint) (maintenance-margin-rate uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (asserts! (> max-leverage u0) ERR-INVALID-SIZE)
    (let ((market-id (var-get next-market-id)))
      (map-set markets
        { market-id: market-id }
        { base-asset-id: base-asset-id,
          quote-asset-id: quote-asset-id,
          is-active: true,
          max-leverage: max-leverage,
          maintenance-margin-rate: maintenance-margin-rate,
          open-interest-long: u0,
          open-interest-short: u0,
          created-at: block-height })
      (var-set next-market-id (+ market-id u1))
      (try! (contract-call? (var-get funding-contract) init-market market-id))
      (print { event: "market-created", market-id: market-id, base-asset-id: base-asset-id })
      (ok market-id))))

(define-public (set-market-active (market-id uint) (is-active bool))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (let ((market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND)))
      (map-set markets { market-id: market-id } (merge market { is-active: is-active }))
      (ok true))))

;; Trading functions

(define-public (open-position (market-id uint) (is-long bool) (size uint) (margin uint) (collateral-asset-id uint))
  (let ((market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND)))
    (asserts! (get is-active market) ERR-MARKET-INACTIVE)
    (asserts! (not (has-position tx-sender market-id)) ERR-POSITION-EXISTS)
    (asserts! (> size u0) ERR-INVALID-SIZE)
    (asserts! (> margin u0) ERR-INSUFFICIENT-MARGIN)
    (let* ((price-data (try! (contract-call? (var-get oracle-contract) get-price (get base-asset-id market))))
           (current-price (get price price-data))
           (notional (* size current-price))
           (required-margin (/ notional (get max-leverage market))))
      (asserts! (>= margin required-margin) ERR-LEVERAGE-EXCEEDED)
      (try! (contract-call? (var-get margin-contract) lock-collateral tx-sender collateral-asset-id margin))
      (let ((entry-funding (contract-call? (var-get funding-contract) get-cumulative-rate market-id)))
        (map-set positions
          { user: tx-sender, market-id: market-id }
          { size: size,
            is-long: is-long,
            entry-price: current-price,
            margin: margin,
            collateral-asset-id: collateral-asset-id,
            entry-funding-rate: entry-funding,
            last-updated: block-height })
        (map-set markets
          { market-id: market-id }
          (merge market
            (if is-long
              { open-interest-long: (+ (get open-interest-long market) notional),
                open-interest-short: (get open-interest-short market) }
              { open-interest-long: (get open-interest-long market),
                open-interest-short: (+ (get open-interest-short market) notional) })))
        (print { event: "position-opened", user: tx-sender, market-id: market-id,
                 is-long: is-long, size: size, entry-price: current-price, margin: margin })
        (ok true)))))

(define-public (close-position (market-id uint))
  (let ((market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
        (pos (unwrap! (map-get? positions { user: tx-sender, market-id: market-id }) ERR-NO-POSITION)))
    (let* ((price-data (try! (contract-call? (var-get oracle-contract) get-price (get base-asset-id market))))
           (current-price (get price price-data))
           (entry-price (get entry-price pos))
           (size (get size pos))
           (margin (get margin pos))
           (collateral-asset (get collateral-asset-id pos))
           (price-delta (if (get is-long pos)
                          (to-int (- current-price entry-price))
                          (to-int (- entry-price current-price))))
           (raw-pnl (* price-delta (to-int size)))
           (funding-payment (contract-call? (var-get funding-contract)
                              get-funding-payment market-id
                              (to-int (if (get is-long pos) size (- u0 size)))
                              (get entry-funding-rate pos)))
           (net-pnl (- raw-pnl funding-payment))
           (effective-margin (+ (to-int margin) net-pnl))
           (notional (* size entry-price))
           (return-amount (if (> effective-margin i0) (to-uint effective-margin) u0)))
      (map-delete positions { user: tx-sender, market-id: market-id })
      (map-set markets
        { market-id: market-id }
        (merge market
          (if (get is-long pos)
            { open-interest-long: (if (>= (get open-interest-long market) notional)
                                    (- (get open-interest-long market) notional) u0),
              open-interest-short: (get open-interest-short market) }
            { open-interest-long: (get open-interest-long market),
              open-interest-short: (if (>= (get open-interest-short market) notional)
                                      (- (get open-interest-short market) notional) u0) })))
      (try! (contract-call? (var-get margin-contract) unlock-collateral tx-sender collateral-asset margin))
      (when (> return-amount u0)
        (try! (contract-call? (var-get margin-contract) transfer-collateral
                (as-contract tx-sender) tx-sender collateral-asset return-amount)))
      (print { event: "position-closed", user: tx-sender, market-id: market-id,
               pnl: net-pnl, return-amount: return-amount })
      (ok net-pnl))))

(define-public (add-margin (market-id uint) (amount uint))
  (let ((pos (unwrap! (map-get? positions { user: tx-sender, market-id: market-id }) ERR-NO-POSITION)))
    (asserts! (> amount u0) ERR-INSUFFICIENT-MARGIN)
    (try! (contract-call? (var-get margin-contract) lock-collateral
            tx-sender (get collateral-asset-id pos) amount))
    (map-set positions
      { user: tx-sender, market-id: market-id }
      (merge pos { margin: (+ (get margin pos) amount) }))
    (print { event: "margin-added", user: tx-sender, market-id: market-id, amount: amount })
    (ok true)))

;; Config setters

(define-public (set-oracle (contract principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (var-set oracle-contract contract) (ok true)))
(define-public (set-margin-manager (contract principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (var-set margin-contract contract) (ok true)))
(define-public (set-funding-rate (contract principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (var-set funding-contract contract) (ok true)))
(define-public (set-liquidation-engine (contract principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (var-set liquidation-contract contract) (ok true)))
