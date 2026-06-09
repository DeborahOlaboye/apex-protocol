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
