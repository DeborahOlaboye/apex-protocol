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
