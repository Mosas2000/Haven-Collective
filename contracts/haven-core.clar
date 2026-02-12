;; haven-core
;; Centralized configuration and admin controls for platform-wide settings

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-FEE (err u101))
(define-constant ERR-PLATFORM-PAUSED (err u102))

(define-data-var admin principal tx-sender)
(define-data-var platform-fee-percentage uint u100)
(define-data-var platform-paused bool false)
(define-data-var pending-admin (optional principal) none)


(define-map authorized-contracts principal bool)

(define-read-only (get-admin)
  (ok (var-get admin))
)

(define-read-only (get-platform-fee)
  (ok (var-get platform-fee-percentage))
)

(define-read-only (is-contract-authorized (contract principal))
  (ok (default-to false (map-get? authorized-contracts contract)))
)

(define-read-only (is-platform-paused)
  (ok (var-get platform-paused))
)

(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (asserts! (<= new-fee u1000) ERR-INVALID-FEE)
    (var-set platform-fee-percentage new-fee)
    (ok true)
  )
)

(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (map-set authorized-contracts contract true)
    (ok true)
  )
)

(define-public (revoke-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (map-set authorized-contracts contract false)
    (ok true)
  )
)

(define-public (toggle-pause)
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (var-set platform-paused (not (var-get platform-paused)))
    (ok true)
  )
)

(define-public (initiate-admin-transfer (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (var-set pending-admin (some new-admin))
    (ok true)
  )
)

(define-public (accept-admin-role)
  (let ((pending (var-get pending-admin)))
    (begin
      (asserts! (is-some pending) ERR-NOT-AUTHORIZED)
      (asserts! (is-eq tx-sender (unwrap! pending ERR-NOT-AUTHORIZED)) ERR-NOT-AUTHORIZED)
      (var-set admin tx-sender)
      (var-set pending-admin none)
      (ok true)
    )
  )
)


