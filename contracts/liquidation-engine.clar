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
