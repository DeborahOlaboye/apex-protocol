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
