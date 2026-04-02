def calculate_mock_cibil(years, transactions, fds, pending_loans, income, loan_amount, tenure):
    base_score = 650
    
   
    old_bank_bonus = min(years * 15, 75)
    transaction_bonus = min(transactions / 10000, 100)
    fd_bonus = min(fds / 5000, 75)
    loan_penalty = min(pending_loans / 2000, 150)

   
    affordability_bonus = 0
    if tenure > 0 and income > 0:
        estimated_emi = loan_amount / tenure
        dti_ratio = estimated_emi / income
        
        if dti_ratio < 0.3:
            affordability_bonus = 50  
        elif dti_ratio > 0.6:
            affordability_bonus = -50 
            affordability_bonus = -150
    else:
        affordability_bonus = -50 

    
    raw_score = base_score + old_bank_bonus + transaction_bonus + fd_bonus - loan_penalty + affordability_bonus
    final_score = max(300, min(900, int(raw_score)))
    
    return final_score