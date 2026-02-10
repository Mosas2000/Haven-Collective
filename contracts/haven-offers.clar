;; haven-offers
;; Handles bid/offer system for NFTs not currently listed

(define-constant ERR-NOT-AUTHORIZED (err u800))
(define-constant ERR-NO-OFFERS (err u801))
(define-constant ERR-OFFER-EXPIRED (err u802))
(define-constant ERR-INVALID-OFFER (err u803))
(define-constant ERR-MAX-OFFERS (err u804))

(define-map offers
  uint
  (list 20 { 
    bidder: principal, 
    amount: uint, 
    expires-at: uint 
  })
)

(define-map active-offer-count uint uint)

(define-read-only (get-offers (token-id uint))
  (ok (default-to (list) (map-get? offers token-id)))
)

(define-read-only (get-offer-count (token-id uint))
  (ok (default-to u0 (map-get? active-offer-count token-id)))
)

(define-public (make-offer (token-id uint) (amount uint) (duration uint))
  (let
    (
      (current-offers (default-to (list) (map-get? offers token-id)))
      (offer-count (default-to u0 (map-get? active-offer-count token-id)))
      (new-offer { 
        bidder: tx-sender, 
        amount: amount, 
        expires-at: (+ block-height duration) 
      })
    )
    (asserts! (> amount u0) ERR-INVALID-OFFER)
    (asserts! (< offer-count u20) ERR-MAX-OFFERS)
    (map-set offers token-id 
      (unwrap! (as-max-len? (append current-offers new-offer) u20) ERR-MAX-OFFERS))
    (map-set active-offer-count token-id (+ offer-count u1))
    (ok true)
  )
)

(define-public (cancel-offer (token-id uint) (offer-index uint))
  (let
    (
      (current-offers (unwrap! (map-get? offers token-id) ERR-NO-OFFERS))
      (offer (unwrap! (element-at current-offers offer-index) ERR-INVALID-OFFER))
    )
    (asserts! (is-eq tx-sender (get bidder offer)) ERR-NOT-AUTHORIZED)
    (map-delete offers token-id)
    (map-set active-offer-count token-id u0)
    (ok true)
  )
)

(define-public (accept-offer (token-id uint) (offer-index uint))
  (let
    (
      (current-offers (unwrap! (map-get? offers token-id) ERR-NO-OFFERS))
      (offer (unwrap! (element-at current-offers offer-index) ERR-INVALID-OFFER))
      (token-owner-result (unwrap! (contract-call? .haven-token get-owner token-id) ERR-NOT-AUTHORIZED))
      (token-owner (unwrap! token-owner-result ERR-NOT-AUTHORIZED))
    )
    (asserts! (is-eq tx-sender token-owner) ERR-NOT-AUTHORIZED)
    (asserts! (<= block-height (get expires-at offer)) ERR-OFFER-EXPIRED)
    (try! (stx-transfer? (get amount offer) (get bidder offer) tx-sender))
    (try! (contract-call? .haven-token transfer token-id tx-sender (get bidder offer)))
    (map-delete offers token-id)
    (map-set active-offer-count token-id u0)
    (ok true)
  )
)
