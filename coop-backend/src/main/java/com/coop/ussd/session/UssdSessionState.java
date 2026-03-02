package com.coop.ussd.session;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Stateless session representation parsed from USSD request.text.
 * Split by "*"; steps[0] is first choice, etc.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UssdSessionState {

    /** Input segments after splitting text by "*". Empty list if text is null/blank. */
    private List<String> steps = new ArrayList<>();

    public static UssdSessionState from(String text) {
        UssdSessionState state = new UssdSessionState();
        if (text != null && !text.trim().isEmpty()) {
            String[] parts = text.trim().split("\\*");
            state.setSteps(new ArrayList<>(Arrays.asList(parts)));
        }
        return state;
    }

    /** 0-based depth: 0 = main menu, 1 = first submenu, etc. */
    public int getDepth() {
        return steps.size();
    }

    /** Get step at index (1-based menu choice). Returns null if out of range. */
    public String getStep(int index) {
        if (index < 0 || index >= steps.size()) return null;
        return steps.get(index);
    }

    /** First choice (main menu selection): "1", "2", "3", "4". */
    public String getMainChoice() {
        return getStep(0);
    }

    /** Second step (e.g. PIN). */
    public String getPin() {
        return getStep(1);
    }

    /** Third step (e.g. loan amount for Apply Loan). */
    public String getLoanAmountInput() {
        return getStep(2);
    }
}
