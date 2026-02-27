package com.coop.institution.repository;

import com.coop.institution.entity.Institution;
import com.coop.institution.entity.InstitutionType;
import com.coop.institution.entity.InstitutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    List<Institution> findByType(InstitutionType type);

    List<Institution> findByStatus(InstitutionStatus status);

    boolean existsByRegistrationNumber(String registrationNumber);
}
