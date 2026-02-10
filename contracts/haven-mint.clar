;; haven-mint
;; Handles NFT minting logic with supply controls and authorization

(define-constant ERR-NOT-AUTHORIZED (err u400))
(define-constant ERR-SUPPLY-EXCEEDED (err u401))
(define-constant ERR-COLLECTION-NOT-FOUND (err u402))
(define-constant ERR-MINT-FAILED (err u403))

(define-map collection-minted uint uint)
(define-map authorized-minters principal bool)

(define-data-var contract-owner principal tx-sender)

(define-read-only (get-minted-count (collection-id uint))
  (ok (default-to u0 (map-get? collection-minted collection-id)))
)

(define-read-only (is-authorized-minter (minter principal))
  (ok (or 
    (is-eq minter (var-get contract-owner))
    (default-to false (map-get? authorized-minters minter))
  ))
)

(define-public (authorize-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (map-set authorized-minters minter true)
    (ok true)
  )
)

(define-public (revoke-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (map-set authorized-minters minter false)
    (ok true)
  )
)

(define-public (mint (collection-id uint) (recipient principal))
  (let
    (
      (minted (default-to u0 (map-get? collection-minted collection-id)))
      (collection (unwrap! (contract-call? .haven-registry get-collection collection-id) ERR-COLLECTION-NOT-FOUND))
      (collection-data (unwrap! collection ERR-COLLECTION-NOT-FOUND))
      (max-supply (get total-supply collection-data))
    )
    (asserts! (unwrap-panic (is-authorized-minter tx-sender)) ERR-NOT-AUTHORIZED)
    (asserts! (< minted max-supply) ERR-SUPPLY-EXCEEDED)
    (try! (contract-call? .haven-token mint recipient))
    (map-set collection-minted collection-id (+ minted u1))
    (ok true)
  )
)

(define-public (batch-mint (collection-id uint) (recipients (list 50 principal)))
  (let
    (
      (collection (unwrap! (contract-call? .haven-registry get-collection collection-id) ERR-COLLECTION-NOT-FOUND))
      (collection-data (unwrap! collection ERR-COLLECTION-NOT-FOUND))
    )
    (asserts! (unwrap-panic (is-authorized-minter tx-sender)) ERR-NOT-AUTHORIZED)
    (ok (map mint-to-recipient recipients))
  )
)

(define-private (mint-to-recipient (recipient principal))
  (begin
    (unwrap-panic (contract-call? .haven-token mint recipient))
    true
  )
)
