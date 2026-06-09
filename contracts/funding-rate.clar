;; Apex Protocol - Funding Rate
;; Calculates and applies 8-hour periodic funding payments between longs and shorts

(define-constant CONTRACT-OWNER tx-sender)
(define-constant FUNDING-INTERVAL u150)
(define-constant MAX-FUNDING-RATE i100)
(define-constant MIN-FUNDING-RATE i-100)
(define-constant BASIS-POINTS i10000)

(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-TOO-EARLY (err u101))
(define-constant ERR-MARKET-NOT-FOUND (err u102))

(define-map funding-rates
  { market-id: uint }
  { rate: int, last-update: uint, cumulative-rate: int })

(define-map authorized-contracts principal bool)
(define-data-var owner principal CONTRACT-OWNER)

;; Read-only functions

(define-read-only (get-funding-rate (market-id uint))
  (map-get? funding-rates { market-id: market-id }))

(define-read-only (get-current-rate (market-id uint))
  (match (map-get? funding-rates { market-id: market-id })
    data (get rate data)
    i0))
