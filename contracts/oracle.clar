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
    (asserts! (<= (- stacks-block-height (get timestamp feed)) STALE-THRESHOLD) ERR-STALE-PRICE)
    (ok { price: (get price feed), timestamp: (get timestamp feed) })))

(define-read-only (is-price-fresh (asset-id uint))
  (match (map-get? price-feeds { asset-id: asset-id })
    feed (<= (- stacks-block-height (get timestamp feed)) STALE-THRESHOLD)
    false))

;; Public functions

(define-public (submit-price (asset-id uint) (price uint))
  (begin
    (asserts! (is-authorized-oracle tx-sender) ERR-UNAUTHORIZED)
    (asserts! (> price u0) ERR-INVALID-PRICE)
    (map-set price-feeds
      { asset-id: asset-id }
      { price: price, timestamp: stacks-block-height, source: tx-sender })
    (print { event: "price-submitted", asset-id: asset-id, price: price, source: tx-sender, block: stacks-block-height })
    (ok true)))

(define-public (add-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (asserts! (not (is-authorized-oracle oracle)) ERR-ALREADY-AUTHORIZED)
    (map-set authorized-oracles oracle true)
    (print { event: "oracle-added", oracle: oracle })
    (ok true)))

(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (map-delete authorized-oracles oracle)
    (print { event: "oracle-removed", oracle: oracle })
    (ok true)))

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (var-set owner new-owner)
    (ok true)))
