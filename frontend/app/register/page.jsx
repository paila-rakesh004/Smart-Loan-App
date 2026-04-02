// "use client";
// import { useState } from "react";
// import API from "@/lib/api";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";

// export default function Register() {
//   const router = useRouter();

//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     phone_number: "",
//     pan_number: "",
//     aadhar_number: "",
//     address: ""
//   });

//   const handleHome = () => {
//     router.push("/");
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await API.post("users/register/", formData);
//       router.push("/login");
//     } catch (error) {
//       console.log(error.response.data);
//       toast.error("Details already exist🤔....unable to register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-[url('/bgimg.png')] bg-cover bg-center font-serif">

      
//       <div className="min-h-screen w-full bg-black/70 flex flex-col md:flex-row">

       
//         <div className="flex-[0.5] text-white flex flex-col justify-center px-6 sm:px-10 md:px-16 py-10">
          
//           <h1 className="text-3xl text-indigo-500 sm:text-4xl md:text-5xl font-bold">
//             Join Smart Loan
//           </h1>

//           <p className="mt-4 text-base sm:text-lg md:text-2xl text-gray-200 max-w-xl">
//             Create your account and step into a smarter way of managing loan applications 
//             with secure and efficient processing.
//           </p>

         

//         </div>

        
//         <div className="flex-[0.5] flex justify-center items-center px-6 py-10">

//           <div className="w-full max-w-md backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl shadow-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">

//             <form onSubmit={handleSubmit} className="flex flex-col gap-3">

//               <h2 className="text-center text-xl sm:text-2xl font-semibold mb-2 text-blue-500">
//                 Customer Register
//               </h2>

//               <label className="text-sm font-medium text-white">Username</label>
//               <input
//                 className="p-2 rounded-xl border border-white/40 bg-white/30 text-white placeholder-white/70 outline-none focus:border-indigo-400 w-full"
//                 name="username"
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//               />

//               <label className="text-sm font-medium text-white">Email</label>
//               <input
//                 className="p-2 rounded-xl border border-white/40 bg-white/30 text-white placeholder-white/70 outline-none focus:border-indigo-400 w-full"
//                 name="email"
//                 type="email"
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//               />

//               <label className="text-sm font-medium text-white">Phone Number</label>
//               <input
//                 className="p-2 rounded-xl border border-white/40 bg-white/30 text-white outline-none focus:border-indigo-400 w-full"
//                 name="phone_number"
//                 maxLength={10}
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//               />

//               <label className="text-sm font-medium text-white">PAN Number</label>
//               <input
//                 className="p-2 rounded-xl border border-white/40 bg-white/30 text-white outline-none focus:border-indigo-400 w-full"
//                 name="pan_number"
//                 maxLength={10}
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//               />

//               <label className="text-sm font-medium text-white">Aadhar Number</label>
//               <input
//                 className="p-2 rounded-xl border border-white/40 bg-white/30 text-white outline-none focus:border-indigo-400 w-full"
//                 name="aadhar_number"
//                 maxLength={12}
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//               />

//               <label className="text-sm font-medium text-white">Address</label>
//               <textarea
//                 className="p-2 rounded-xl border border-white/40 bg-white/30 text-white outline-none focus:border-indigo-400 w-full"
//                 name="address"
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//               />

//               <label className="text-sm font-medium text-white">Password</label>
//               <input
//                 className="p-2 rounded-xl border border-white/40 bg-white/30 text-white outline-none focus:border-indigo-400 w-full"
//                 name="password"
//                 type="password"
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//               />

              
//               <button
//                 type="submit"
//                 className="mt-4 py-2 rounded-xl bg-indigo-500 text-white text-base sm:text-lg hover:bg-indigo-700 transition transform cursor-pointer hover:-translate-y-1"
//                 disabled={loading}
//               >
//                 {loading ? "Creating Account..." : "Register"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleHome}
//                 className="py-2 rounded-xl bg-blue-500 text-white text-base sm:text-lg hover:bg-blue-700 transition transform cursor-pointer hover:-translate-y-1"
//               >
//                 Home
//               </button>

//             </form>
//           </div>
//         </div>
//       </div>

//       {/* LOADING (UNCHANGED) */}
//       {loading && (
//         <div className="fixed inset-0 bg-black/40 flex flex-col justify-center items-center z-50">

//           <div className="w-14 h-14 border-[5px] border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>

//           <p className="mt-4 text-white text-base sm:text-lg font-medium">
//             Creating your account...
//           </p>

//         </div>
//       )}
//     </div>
//   );
// }