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
