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
