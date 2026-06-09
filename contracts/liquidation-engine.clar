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
