// Sample services across Ghanaian universities
const services = [
  { id: 1, title: "Laundry Service", category: "Laundry", description: "Washing & ironing, Unity Hall Room 45.", price: "GH₵10 per bucket", university: "KNUST", hostel: "Unity Hall", contact: "0541234567", image: "" },
  { id: 2, title: "Food Delivery", category: "Food", description: "Fufu & soup delivery, Independence Hall.", price: "GH₵25 per plate", university: "KNUST", hostel: "Independence Hall", contact: "0247654321", image: "" },
  { id: 3, title: "Calculus Tutoring", category: "Tutoring", description: "First-year tutoring, evenings.", price: "GH₵50 per session", university: "Legon", hostel: "Pent Hall", contact: "0509876543", image: "" },
  { id: 4, title: "Printing & Photocopy", category: "Printing", description: "B/W and Color, fast service.", price: "GH₵0.50 per page", university: "UCC", hostel: "Casely Hayford (Casford)", contact: "0271239876", image: "" },
  { id: 5, title: "Hair Braiding", category: "Beauty", description: "Knotless & twists, weekend slots.", price: "From GH₵80", university: "UEW", hostel: "Aggrey Hall", contact: "0552223344", image: "" },
  { id: 6, title: "Phone Repairs", category: "Repairs", description: "Screens, batteries, diagnostics.", price: "From GH₵60", university: "UDS", hostel: "Jubilee Hall", contact: "0267788990", image: "" },
  { id: 7, title: "Gowns & Suits Rental", category: "Fashion", description: "Affordable rentals for events.", price: "From GH₵40/day", university: "UPSA", hostel: "Pentagon Hostels", contact: "0249988776", image: "" },
  { id: 8, title: "Project Typing", category: "Printing", description: "Formatting & printing final docs.", price: "GH₵1.00 per page", university: "UMaT", hostel: "Gold Hall", contact: "0596677889", image: "" },
  { id: 9, title: "Jollof & Grills", category: "Food", description: "Evening orders, campus delivery.", price: "GH₵30 per pack", university: "Koforidua Technical University", hostel: "Abba Bentil", contact: "0203344556", image: "" },
  { id:10, title: "Laundry Pick-up", category: "Laundry", description: "Pick and drop at hall gate.", price: "GH₵12 per bucket", university: "Ho Technical University", hostel: "GetFund Hostel", contact: "0205566778", image: "" },
  { id:11, title: "Graphic Design", category: "Tech", description: "Logos, posters, flyers 24h.", price: "From GH₵70", university: "Ashesi University", hostel: "Hostel A", contact: "0540001122", image: "" },
  { id:12, title: "Makeup & Gele", category: "Beauty", description: "Occasion looks, early morning slots.", price: "From GH₵100", university: "Central University", hostel: "Miotso Hostels", contact: "0241112233", image: "" },
  { id:13, title: "CV & Cover Letter", category: "Tutoring", description: "Career guidance & document review.", price: "GH₵40 per session", university: "GIMPA", hostel: "Greenhill", contact: "0501122334", image: "" },
  { id:14, title: "3D Printing", category: "Tech", description: "Prototyping service for projects.", price: "From GH₵120", university: "UENR", hostel: "GetFund Hostel", contact: "0559988776", image: "" },
  { id:15, title: "Bike Delivery", category: "Delivery", description: "Campus courier for parcels & food.", price: "From GH₵15", university: "Takoradi Technical University", hostel: "Main Hostel", contact: "0245566001", image: "" },
  { id:16, title: "Dress Making", category: "Fashion", description: "Custom fittings, 3–5 days.", price: "From GH₵150", university: "Sunyani Technical University", hostel: "New Hall", contact: "0263300445", image: "" },
  { id:17, title: "Data Analysis Tutor", category: "Tutoring", description: "Excel/SPSS/R for thesis.", price: "GH₵70 per hour", university: "KNUST", hostel: "Queens Hall", contact: "0204455667", image: "" },
  { id:18, title: "Laptop Cleaning", category: "Tech", description: "Thermal paste & dust removal.", price: "GH₵80", university: "Legon", hostel: "Jean Nelson Hall", contact: "0591122003", image: "" },
  { id:19, title: "Poster Printing A3", category: "Printing", description: "Matte & glossy options.", price: "GH₵8 per sheet", university: "UEW", hostel: "Simpa Hall", contact: "0276600112", image: "" },
  { id:20, title: "Kinky & Fish", category: "Food", description: "Morning deliveries, campus-only.", price: "GH₵18 per pack", university: "UCC", hostel: "Valco Hall", contact: "0507788996", image: "" },
  { id:21, title: "Shoe Repairs", category: "Repairs", description: "Soles, stitching while you wait.", price: "From GH₵25", university: "UPSA", hostel: "Bani Hostel", contact: "0209900112", image: "" },
  { id:22, title: "Haircut (On-call)", category: "Beauty", description: "Hostel visits, evening slots.", price: "GH₵35", university: "UDS", hostel: "Nyohini", contact: "0247001122", image: "" },
  { id:23, title: "Parcel Delivery", category: "Delivery", description: "Within campus & suburbs.", price: "From GH₵12", university: "UMaT", hostel: "Tarkwa Main", contact: "0547007788", image: "" },
  { id:24, title: "Math Group Tutor", category: "Tutoring", description: "Group sessions up to 5 people.", price: "GH₵30 per person", university: "Koforidua Technical University", hostel: "Old Hostel", contact: "0206677889", image: "" }
];

// Universities list derived from services or override here
const universities = Array.from(new Set(services.map(s => s.university))).sort();
