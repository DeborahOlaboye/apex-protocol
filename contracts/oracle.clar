;; Apex Protocol - Price Oracle
;; Manages price feeds from authorized oracle providers with staleness protection

(define-constant CONTRACT-OWNER tx-sender)
(define-constant SBTC-ASSET-ID u1)
(define-constant STX-ASSET-ID u2)
(define-constant STALE-THRESHOLD u150)

(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-STALE-PRICE (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PRICE (err u103))
(define-constant ERR-ALREADY-AUTHORIZED (err u104))

(define-map price-feeds
  { asset-id: uint }
  { price: uint, timestamp: uint, source: principal })

(define-map authorized-oracles principal bool)

(define-data-var owner principal CONTRACT-OWNER)
