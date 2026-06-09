;; Apex Protocol - Margin Manager
;; Tracks collateral balances, locks/unlocks margin for positions

(define-constant CONTRACT-OWNER tx-sender)
(define-constant STX-ASSET-ID u1)
(define-constant SBTC-ASSET-ID u2)

(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INSUFFICIENT-UNLOCKED (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant ERR-ASSET-NOT-SUPPORTED (err u104))
(define-constant ERR-TRANSFER-FAILED (err u105))

;; Collateral balances: total and locked per user per asset
(define-map collateral-balances
  { user: principal, asset-id: uint }
  { amount: uint, locked: uint })

;; Contracts authorized to lock/unlock/transfer collateral
(define-map authorized-contracts principal bool)

(define-data-var owner principal CONTRACT-OWNER)
(define-data-var sbtc-contract principal 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sbtc-token)

;; Read-only functions

(define-read-only (get-balance (user principal) (asset-id uint))
  (default-to { amount: u0, locked: u0 }
    (map-get? collateral-balances { user: user, asset-id: asset-id })))

(define-read-only (get-available-balance (user principal) (asset-id uint))
  (let ((bal (get-balance user asset-id)))
    (- (get amount bal) (get locked bal))))

(define-read-only (is-authorized (contract principal))
  (default-to false (map-get? authorized-contracts contract)))

;; Internal helpers

(define-private (add-balance (user principal) (asset-id uint) (amount uint))
  (let ((current (get-balance user asset-id)))
    (map-set collateral-balances
      { user: user, asset-id: asset-id }
      { amount: (+ (get amount current) amount), locked: (get locked current) })))

(define-private (subtract-balance (user principal) (asset-id uint) (amount uint))
  (let ((current (get-balance user asset-id)))
    (asserts! (>= (get-available-balance user asset-id) amount) ERR-INSUFFICIENT-UNLOCKED)
    (map-set collateral-balances
      { user: user, asset-id: asset-id }
      { amount: (- (get amount current) amount), locked: (get locked current) })
    (ok true)))

;; Public functions

(define-public (deposit-stx (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (add-balance tx-sender STX-ASSET-ID amount)
    (print { event: "deposit", user: tx-sender, asset-id: STX-ASSET-ID, amount: amount })
    (ok true)))

(define-public (deposit-sbtc (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (contract-call? (var-get sbtc-contract) transfer amount tx-sender (as-contract tx-sender) none))
    (add-balance tx-sender SBTC-ASSET-ID amount)
    (print { event: "deposit", user: tx-sender, asset-id: SBTC-ASSET-ID, amount: amount })
    (ok true)))

(define-public (withdraw (asset-id uint) (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (or (is-eq asset-id STX-ASSET-ID) (is-eq asset-id SBTC-ASSET-ID)) ERR-ASSET-NOT-SUPPORTED)
    (try! (subtract-balance tx-sender asset-id amount))
    (if (is-eq asset-id STX-ASSET-ID)
      (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
      (try! (as-contract (contract-call? (var-get sbtc-contract) transfer amount tx-sender tx-sender none))))
    (print { event: "withdraw", user: tx-sender, asset-id: asset-id, amount: amount })
    (ok true)))

(define-public (lock-collateral (user principal) (asset-id uint) (amount uint))
  (begin
    (asserts! (is-authorized tx-sender) ERR-UNAUTHORIZED)
    (asserts! (>= (get-available-balance user asset-id) amount) ERR-INSUFFICIENT-UNLOCKED)
    (let ((current (get-balance user asset-id)))
      (map-set collateral-balances
        { user: user, asset-id: asset-id }
        { amount: (get amount current), locked: (+ (get locked current) amount) }))
    (ok true)))

(define-public (unlock-collateral (user principal) (asset-id uint) (amount uint))
  (begin
    (asserts! (is-authorized tx-sender) ERR-UNAUTHORIZED)
    (let ((current (get-balance user asset-id)))
      (asserts! (>= (get locked current) amount) ERR-INSUFFICIENT-BALANCE)
      (map-set collateral-balances
        { user: user, asset-id: asset-id }
        { amount: (get amount current), locked: (- (get locked current) amount) }))
    (ok true)))
