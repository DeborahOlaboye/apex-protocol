;; Apex Protocol - Liquidation Engine
;; Liquidates undercollateralized positions and distributes proceeds

(define-constant CONTRACT-OWNER tx-sender)
(define-constant LIQUIDATION-BONUS u500)   ;; 5% in basis points
(define-constant INSURANCE-CUT u2000)      ;; 20% of seized margin to insurance fund
(define-constant BASIS-POINTS u10000)

(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-NOT-LIQUIDATABLE (err u301))
(define-constant ERR-NO-POSITION (err u302))
(define-constant ERR-MARKET-NOT-FOUND (err u303))
(define-constant ERR-TRANSFER-FAILED (err u304))

(define-map liquidation-history
  { user: principal, market-id: uint, block: uint }
  { liquidated-by: principal, margin-seized: uint, bonus-paid: uint })

(define-data-var owner principal CONTRACT-OWNER)
(define-data-var insurance-fund principal CONTRACT-OWNER)
(define-data-var clearing-house-contract principal CONTRACT-OWNER)
(define-data-var margin-contract principal CONTRACT-OWNER)

;; Read-only functions

(define-read-only (get-insurance-fund)
  (var-get insurance-fund))

(define-read-only (get-liquidation (user principal) (market-id uint) (block uint))
  (map-get? liquidation-history { user: user, market-id: market-id, block: block }))

(define-read-only (is-liquidatable (user principal) (market-id uint))
  (match (contract-call? (var-get clearing-house-contract) get-margin-ratio user market-id)
    ratio
    (let ((market (unwrap-panic (contract-call? (var-get clearing-house-contract) get-market market-id))))
      (< ratio (to-int (get maintenance-margin-rate market))))
    err false))

;; Public functions

(define-public (liquidate (user principal) (market-id uint))
  (begin
    (asserts! (not (is-eq tx-sender user)) ERR-UNAUTHORIZED)
    (asserts! (is-liquidatable user market-id) ERR-NOT-LIQUIDATABLE)
    (let* ((pos (unwrap! (contract-call? (var-get clearing-house-contract) get-position user market-id) ERR-NO-POSITION))
           (margin (get margin pos))
           (collateral-asset (get collateral-asset-id pos))
           (bonus (/ (* margin LIQUIDATION-BONUS) BASIS-POINTS))
           (insurance-amount (/ (* margin INSURANCE-CUT) BASIS-POINTS))
           (remainder (- margin (+ bonus insurance-amount))))
      (try! (contract-call? (var-get clearing-house-contract) close-position market-id))
      (when (> bonus u0)
        (try! (contract-call? (var-get margin-contract) transfer-collateral
                (as-contract tx-sender) tx-sender collateral-asset bonus)))
      (when (> insurance-amount u0)
        (try! (contract-call? (var-get margin-contract) transfer-collateral
                (as-contract tx-sender) (var-get insurance-fund) collateral-asset insurance-amount)))
      (map-set liquidation-history
        { user: user, market-id: market-id, block: block-height }
        { liquidated-by: tx-sender, margin-seized: margin, bonus-paid: bonus })
      (print { event: "liquidation", user: user, market-id: market-id,
               liquidator: tx-sender, margin-seized: margin, bonus: bonus,
               insurance: insurance-amount, block: block-height })
      (ok { margin-seized: margin, bonus: bonus }))))

(define-public (set-insurance-fund (address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (var-set insurance-fund address)
    (ok true)))

(define-public (set-clearing-house (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (var-set clearing-house-contract contract)
    (ok true)))

(define-public (set-margin-manager (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (var-set margin-contract contract)
    (ok true)))
