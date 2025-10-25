/* =========================================================
   CampusConnect — Data Configuration File
   Author: Godfred Sefa Aboagye
   Description: Contains university list and category data 
                safely exported to avoid re-declaration errors.
   ========================================================= */

// 🧠 Use global guard to prevent redeclaration when reloaded
if (!window.CampusConnectData) {
  window.CampusConnectData = {};

  // 🎓 University List
  window.CampusConnectData.universities = [
    "University of Ghana (UG)",
    "Kwame Nkrumah University of Science and Technology (KNUST)",
    "University of Cape Coast (UCC)",
    "University for Development Studies (UDS)",
    "University of Education, Winneba (UEW)",
    "University of Mines and Technology (UMaT)",
    "University of Energy and Natural Resources (UENR)",
    "University of Health and Allied Sciences (UHAS)",
    "C.K. Tedam University of Technology and Applied Sciences (CKT-UTAS)",
    "Simon Diedong Dombo University of Business and Integrated Development Studies (SDD-UBIDS)",
    "Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development (AAMUSTED)",
    "Ghana Communication Technology University (GCTU)",
    "Ghana Institute of Journalism (GIJ) — now part of UniMAC",
    "Ghana Institute of Management and Public Administration (GIMPA)",
    "University of Professional Studies, Accra (UPSA)",
    "University of Media, Arts and Communication (UniMAC)",
    "University of Environment and Sustainable Development (UESD)"
  ];

  // 🏷️ Common Service Categories (optional enhancement)
  window.CampusConnectData.categories = [
    "Laundry",
    "Tutoring",
    "Food Delivery",
    "Printing & Photocopy",
    "Room Cleaning",
    "Barbering & Hairdressing",
    "Tech Repairs",
    "Photography",
    "Transportation",
    "Accommodation Assistance",
    "Others"
  ];

  // 🌍 Export for backward compatibility
  window.universities = window.CampusConnectData.universities;
  window.categories = window.CampusConnectData.categories;
}

