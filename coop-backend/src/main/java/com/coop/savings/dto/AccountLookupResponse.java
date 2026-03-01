package com.coop.savings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountLookupResponse {

    private Long accountId;
    private String accountNumber;
    private String memberName;
    private String memberNumber;
    private String productName;
}
