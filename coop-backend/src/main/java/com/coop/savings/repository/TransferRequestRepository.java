package com.coop.savings.repository;

import com.coop.savings.entity.TransferRequest;
import com.coop.savings.entity.TransferRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {

    List<TransferRequest> findBySourceAccountMemberIdOrderByCreatedAtDesc(Long memberId);

    List<TransferRequest> findBySourceAccountMemberSaccoIdOrderByCreatedAtDesc(Long saccoId);

    List<TransferRequest> findBySourceAccountMemberSaccoIdAndStatusOrderByCreatedAtDesc(Long saccoId, TransferRequestStatus status);

    /** For member transfer history: sent (source) and received (destination after approval). */
    List<TransferRequest> findBySourceAccountMemberIdOrDestinationAccountMemberIdOrderByCreatedAtDesc(Long sourceMemberId, Long destinationMemberId);
}
