;; Apex Protocol - Funding Rate
;; Calculates and applies 8-hour periodic funding payments between longs and shorts

(define-constant CONTRACT-OWNER tx-sender)
(define-constant FUNDING-INTERVAL u150)
(define-constant MAX-FUNDING-RATE 100)
(define-constant MIN-FUNDING-RATE -100)
(define-constant BASIS-POINTS 10000)

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
    0))

(define-read-only (get-cumulative-rate (market-id uint))
  (match (map-get? funding-rates { market-id: market-id })
    data (get cumulative-rate data)
    0))

(define-read-only (can-apply-funding (market-id uint))
  (match (map-get? funding-rates { market-id: market-id })
    data (>= stacks-block-height (+ (get last-update data) FUNDING-INTERVAL))
    true))

;; Calculates funding payment for a position
;; Positive = position pays, Negative = position receives
(define-read-only (get-funding-payment (market-id uint) (position-size int) (entry-cumulative-rate int))
  (let ((current-cumulative (get-cumulative-rate market-id))
        (rate-delta (- current-cumulative entry-cumulative-rate)))
    ;; longs pay when rate > 0, shorts receive; inverted when rate < 0
    (* position-size (/ rate-delta BASIS-POINTS))))

;; Clamp a value between min and max
(define-private (clamp-rate (rate int))
  (if (> rate MAX-FUNDING-RATE)
    MAX-FUNDING-RATE
    (if (< rate MIN-FUNDING-RATE)
      MIN-FUNDING-RATE
      rate)))

;; Public functions

;; Calculate rate as premium between mark and index price (basis points)
(define-public (calculate-funding-rate (market-id uint) (mark-price uint) (index-price uint))
  (begin
    (asserts! (default-to false (map-get? authorized-contracts tx-sender)) ERR-UNAUTHORIZED)
    (let ((mark (to-int mark-price))
           (index (to-int index-price))
           (premium (if (> index 0)
                      (/ (* (- mark index) BASIS-POINTS) index)
                      0))
           (clamped (clamp-rate premium)))
      (match (map-get? funding-rates { market-id: market-id })
        existing
        (map-set funding-rates
          { market-id: market-id }
          (merge existing { rate: clamped }))
        (map-set funding-rates
          { market-id: market-id }
          { rate: clamped, last-update: stacks-block-height, cumulative-rate: 0}))
      (ok clamped))))

(define-public (apply-funding (market-id uint))
  (begin
    (asserts! (default-to false (map-get? authorized-contracts tx-sender)) ERR-UNAUTHORIZED)
    (let ((data (unwrap! (map-get? funding-rates { market-id: market-id }) ERR-MARKET-NOT-FOUND)))
      (asserts! (>= stacks-block-height (+ (get last-update data) FUNDING-INTERVAL)) ERR-TOO-EARLY)
      (map-set funding-rates
        { market-id: market-id }
        { rate: (get rate data),
          last-update: stacks-block-height,
          cumulative-rate: (+ (get cumulative-rate data) (get rate data)) })
      (print { event: "funding-applied", market-id: market-id, rate: (get rate data), block: stacks-block-height })
      (ok (get rate data)))))

(define-public (init-market (market-id uint))
  (begin
    (asserts! (default-to false (map-get? authorized-contracts tx-sender)) ERR-UNAUTHORIZED)
    (map-set funding-rates
      { market-id: market-id }
      { rate: 0, last-update: stacks-block-height, cumulative-rate: 0})
    (ok true)))

(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (map-set authorized-contracts contract true)
    (ok true)))
