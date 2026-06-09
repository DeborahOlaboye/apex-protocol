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

;; Read-only functions

(define-read-only (get-owner)
  (var-get owner))

(define-read-only (is-authorized-oracle (oracle principal))
  (default-to false (map-get? authorized-oracles oracle)))

(define-read-only (get-latest-price (asset-id uint))
  (map-get? price-feeds { asset-id: asset-id }))

(define-read-only (get-price (asset-id uint))
  (let ((feed (unwrap! (map-get? price-feeds { asset-id: asset-id }) ERR-NOT-FOUND)))
    (asserts! (<= (- block-height (get timestamp feed)) STALE-THRESHOLD) ERR-STALE-PRICE)
    (ok { price: (get price feed), timestamp: (get timestamp feed) })))

(define-read-only (is-price-fresh (asset-id uint))
  (match (map-get? price-feeds { asset-id: asset-id })
    feed (<= (- block-height (get timestamp feed)) STALE-THRESHOLD)
    false))
