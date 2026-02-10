;; haven-royalty
;; Manages creator royalties on secondary sales with multi-party splits

(define-constant ERR-NOT-AUTHORIZED (err u700))
(define-constant ERR-INVALID-PERCENTAGE (err u701))
(define-constant ERR-INVALID-RECIPIENTS (err u702))
(define-constant ERR-COLLECTION-NOT-FOUND (err u703))

(define-data-var default-royalty uint u500)

(define-map royalty-config
  uint
  {
    recipients: (list 5 principal),
    percentages: (list 5 uint)
  }
)

(define-read-only (get-royalty-config (collection-id uint))
  (ok (map-get? royalty-config collection-id))
)

(define-read-only (get-default-royalty)
  (ok (var-get default-royalty))
)

(define-read-only (calculate-royalty (collection-id uint) (sale-amount uint))
  (let
    (
      (config (map-get? royalty-config collection-id))
      (royalty-rate (if (is-some config) 
        (fold + (get percentages (unwrap-panic config)) u0)
        (var-get default-royalty)))
    )
    (ok (/ (* sale-amount royalty-rate) u10000))
  )
)

(define-public (set-royalty (collection-id uint) (recipients (list 5 principal)) (percentages (list 5 uint)))
  (let
    (
      (collection (unwrap! (contract-call? .haven-registry get-collection collection-id) ERR-COLLECTION-NOT-FOUND))
      (collection-data (unwrap! collection ERR-COLLECTION-NOT-FOUND))
      (creator (get creator collection-data))
      (total-percentage (fold + percentages u0))
    )
    (asserts! (is-eq tx-sender creator) ERR-NOT-AUTHORIZED)
    (asserts! (<= total-percentage u10000) ERR-INVALID-PERCENTAGE)
    (asserts! (is-eq (len recipients) (len percentages)) ERR-INVALID-RECIPIENTS)
    (map-set royalty-config collection-id {
      recipients: recipients,
      percentages: percentages
    })
    (ok true)
  )
)

(define-public (distribute-royalty (collection-id uint) (sale-amount uint))
  (let
    (
      (config (map-get? royalty-config collection-id))
    )
    (if (is-some config)
      (let
        (
          (royalty-data (unwrap-panic config))
          (recipients (get recipients royalty-data))
          (percentages (get percentages royalty-data))
        )
        (ok (fold distribute-to-recipient 
          (map create-distribution-tuple recipients percentages)
          sale-amount))
      )
      (ok sale-amount)
    )
  )
)

(define-private (create-distribution-tuple (recipient principal) (percentage uint))
  { recipient: recipient, percentage: percentage }
)

(define-private (distribute-to-recipient (dist-tuple { recipient: principal, percentage: uint }) (remaining-amount uint))
  (let
    (
      (amount (/ (* remaining-amount (get percentage dist-tuple)) u10000))
    )
    (unwrap-panic (stx-transfer? amount tx-sender (get recipient dist-tuple)))
    remaining-amount
  )
)
