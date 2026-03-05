"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import styles from './page.module.css';
import { toast } from "react-toastify";

export default function ApplyLoan() {
  const router = useRouter();

  const [form, setForm] = useState({
    occupation: "",
    organizationName: "",
    monthlyIncome: "",
    LoanType: "",
    tenure: "",
    loanAmount: "", 
    idproof: null,
    addressProof: null,
    salarySlips: null,
    EmpIDcard: null,
    nomineeName: "",
    nomineeIDcard: null,
    nomineeAddressproof: null,
    nomineesign: null,
  });

  const handlevalueChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in!");
      return;
    }

    
    const dataToSend = new FormData();
    
    dataToSend.append('occupation', form.occupation);
    dataToSend.append('organization_name', form.organizationName);
    dataToSend.append('monthly_income', form.monthlyIncome);
    dataToSend.append('loan_amount', form.loanAmount);
    dataToSend.append('loan_type', form.LoanType);
    dataToSend.append('tenure', form.tenure);
    dataToSend.append('nominee_name', form.nomineeName);

    if (form.idproof) dataToSend.append('id_proof', form.idproof);
    if (form.addressProof) dataToSend.append('address_proof', form.addressProof);
    if (form.salarySlips) dataToSend.append('salary_slips', form.salarySlips);
    if (form.EmpIDcard) dataToSend.append('emp_id_card', form.EmpIDcard);
    if (form.nomineeIDcard) dataToSend.append('nominee_id_card', form.nomineeIDcard);
    if (form.nomineeAddressproof) dataToSend.append('nominee_address_proof', form.nomineeAddressproof);
    if (form.nomineesign) dataToSend.append('nominee_sign', form.nomineesign);

    try { 
      const response = await API.post('loans/apply/', dataToSend, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Success:", response.data);
      // alert("Application submitted successfully!");
      toast.success("Loan submitted successfully!");
      router.push('/dashboard/customer'); 

    } catch (error) {
      console.error("Error submitting loan:", error);
      // alert("Submission Failed: " + (error.response?.data ? JSON.stringify(error.response.data) : "Unknown Error"));
      toast.error("Something went wrong!");
    }
  };
   useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}><h1>Apply for a Loan</h1></div>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.s1}>
            <div className={styles.headings}>Employment Details</div>
            <div className={styles.inp}>
              <label><span className={styles.span}>Employee Occupation</span></label>
              <input name="occupation" placeholder="Occupation (e.g., Engineer)" onChange={handlevalueChange} className={styles.input} required />
              <label><span className={styles.span}>Employee Organization</span></label>
              <input name="organizationName" placeholder="Organization Name" onChange={handlevalueChange} className={styles.input} required />
              <label><span className={styles.span}>Monthly Income</span></label>
              <input name="monthlyIncome" type="number" placeholder="Monthly Income" onChange={handlevalueChange} className={styles.input} required />
            </div>
          </div>


          <div className={styles.s1}>
            <div className={styles.headings}>Loan Request</div>
            <div className={styles.inp}>
              <label><span className={styles.span}>Loan Type</span></label>
              <select name="LoanType" onChange={handlevalueChange} required className={styles.input} defaultValue="">
                <option value="" disabled>Select Loan Type</option>
                <option value="Personal">Personal Loan</option>
                <option value="Home">Home Loan</option>
                <option value="Education">Education Loan</option>
                <option value="Gold">Gold Loan</option>
              </select>
              <label><span className={styles.span}>Tenure (in Months)</span></label>
              <input name="tenure" type="number" placeholder="Tenure (in months)" onChange={handlevalueChange} className={styles.input} required />
              <label ><span className={styles.span}>Loan Amount</span></label>
              <input name="loanAmount" type='number' placeholder='Loan Amount' onChange={handlevalueChange} className={styles.input} required />
            </div>
          </div>

          <div className={styles.s1}>
            <div className={styles.headings}>Your Documents (PDF/Image)</div>
            <div>
              <div>
                <label><span className={styles.span}>ID Proof (PAN / Aadhar) : </span></label>
                <input type="file" name="idproof" onChange={handleFileChange} className={styles.input} required />
              </div>
              <div>
                <label><span className={styles.span}>Address Proof : </span></label>
                <input type="file" name="addressProof" onChange={handleFileChange} className={styles.input} required />
              </div>
              <div>
                <label><span className={styles.span}>Salary Slips (Last 3 Months) : </span></label>
                <input type="file" name="salarySlips" onChange={handleFileChange} className={styles.input} required />
              </div>
              <div>
                <label><span className={styles.span}>Employee ID Card : </span></label>
                <input type="file" name="EmpIDcard" onChange={handleFileChange} className={styles.input} required />
              </div>
            </div>
          </div>
     
          <div className={styles.s1}>
            <div className={styles.headings}>Nominee Details</div>
            <div>
              <label><span className={styles.span}>Nominee Name : </span></label>
              <input name="nomineeName" placeholder="Nominee Name" onChange={handlevalueChange} className={styles.input} required />
              <div>
                <label><span className={styles.span}>Nominee ID Proof : </span></label>
                <input type="file" name="nomineeIDcard" onChange={handleFileChange} className={styles.input} required />
              </div>
              <div>
                <label><span className={styles.span}>Nominee Address Proof : </span></label>
                <input type="file" name="nomineeAddressproof" onChange={handleFileChange} className={styles.input} required />
              </div>
              <div>
                <label><span className={styles.span}>Nominee Signature : </span></label>
                <input type="file" name="nomineesign" onChange={handleFileChange} className={styles.input} required />
              </div>
            </div>
          </div>
      
          <div className={styles.btn}>
            <button className={styles.cbtn} type="button" onClick={() => router.push("/dashboard/customer")}>
             Cancel
            </button>
            <button className={styles.sbtn} type="submit">
              Submit Application
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}