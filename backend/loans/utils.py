def calculate_mock_cibil(years, transactions, fds, pending_loans):

    
    base_score = 650
    
    old_bank_bonus = min(years * 15, 75)
    
    transaction_bonus = min(transactions / 10000, 100)
    
    fd_bonus = min(fds / 5000, 75)
    
    loan_penalty = min(pending_loans / 2000, 150)

    raw_score = base_score + old_bank_bonus + transaction_bonus + fd_bonus - loan_penalty
    
    final_score = max(300, min(900, int(raw_score)))
    
    return final_score
