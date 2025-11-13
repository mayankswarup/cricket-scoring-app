import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// 1) Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2) === BASE 75 GROUNDS (from first list) ===
const baseGrounds = [
  { "name": "JustPlay Sports Arena", "area": "Electronic City", "type": "paid", "lat": 12.8238, "lng": 77.6684 },
  { "name": "Decathlon Anubhava Ground", "area": "Hennur", "type": "paid", "lat": 13.0647, "lng": 77.6489 },
  { "name": "XLR8 Indoor Arena", "area": "Kothanur", "type": "paid", "lat": 13.0705, "lng": 77.6420 },
  { "name": "Tiento Sports Arena", "area": "Sarjapur Road", "type": "paid", "lat": 12.9030, "lng": 77.7060 },
  { "name": "Sports Central Sarjapur", "area": "Chikkakannalli", "type": "paid", "lat": 12.9009, "lng": 77.6949 },
  { "name": "Play Mania Sports", "area": "Bellandur", "type": "paid", "lat": 12.9143, "lng": 77.6781 },
  { "name": "Smart Sports Arena", "area": "Hebbal", "type": "paid", "lat": 13.0368, "lng": 77.5972 },
  { "name": "Loyola School Ground", "area": "Bannerghatta Road", "type": "mixed", "lat": 12.8928, "lng": 77.5979 },
  { "name": "RBANMS Ground", "area": "Ulsoor", "type": "paid", "lat": 12.9835, "lng": 77.6203 },
  { "name": "Western Railway Ground", "area": "Benson Town", "type": "paid", "lat": 12.9996, "lng": 77.6055 },
  { "name": "BBMP Koramangala 3rd Block Ground", "area": "Koramangala", "type": "free", "lat": 12.9346, "lng": 77.6242 },
  { "name": "NGV Ground", "area": "Koramangala 5th Block", "type": "free", "lat": 12.9358, "lng": 77.6222 },
  { "name": "HSR BDA Complex Ground", "area": "HSR Layout", "type": "free", "lat": 12.9107, "lng": 77.6461 },
  { "name": "Agara Lake Park Ground", "area": "Agara", "type": "free", "lat": 12.9128, "lng": 77.6402 },
  { "name": "JP Nagar BBMP 3rd Phase Ground", "area": "JP Nagar", "type": "free", "lat": 12.9043, "lng": 77.5851 },
  { "name": "ITC Factory Ground", "area": "Cox Town", "type": "free", "lat": 13.0090, "lng": 77.6222 },
  { "name": "HAL Open Ground", "area": "Old Airport Road", "type": "free", "lat": 12.9638, "lng": 77.6668 },
  { "name": "Carmelaram Open Ground", "area": "Carmelaram", "type": "free", "lat": 12.9252, "lng": 77.7161 },
  { "name": "Sarjapur Kodathi School Ground", "area": "Sarjapur Road", "type": "free", "lat": 12.8847, "lng": 77.7336 },
  { "name": "GKVK University Ground", "area": "Yelahanka", "type": "free", "lat": 13.0846, "lng": 77.5852 },
  { "name": "Decathlon Mysore Road Turf", "area": "Mysore Road", "type": "paid", "lat": 12.9595, "lng": 77.4837 },
  { "name": "Grasshopper Turf", "area": "Sarjapur Road", "type": "paid", "lat": 12.9041, "lng": 77.6900 },
  { "name": "TurfPark Sarjapur", "area": "Sarjapur Road", "type": "paid", "lat": 12.9080, "lng": 77.6961 },
  { "name": "TurfPark HSR", "area": "HSR Layout", "type": "paid", "lat": 12.9154, "lng": 77.6428 },
  { "name": "Tiger 5 Sports Arena", "area": "Bellandur", "type": "paid", "lat": 12.9194, "lng": 77.6790 },
  { "name": "GameOn Sports", "area": "Yelahanka", "type": "paid", "lat": 13.0931, "lng": 77.6020 },
  { "name": "Eagle Ridge Ground", "area": "Begur", "type": "paid", "lat": 12.8697, "lng": 77.6271 },
  { "name": "Nice Cricket Ground", "area": "Bannerghatta", "type": "paid", "lat": 12.8381, "lng": 77.5910 },
  { "name": "Sports Villa Ground", "area": "Hoodi", "type": "paid", "lat": 12.9931, "lng": 77.7170 },
  { "name": "Play Factory Ground", "area": "Hosur Road", "type": "paid", "lat": 12.8370, "lng": 77.6789 },
  { "name": "BTM Layout Ground", "area": "BTM", "type": "free", "lat": 12.9161, "lng": 77.6100 },
  { "name": "Jakkur Lake Ground", "area": "Jakkur", "type": "free", "lat": 13.0805, "lng": 77.5981 },
  { "name": "Kengeri Lake Grounds", "area": "Kengeri", "type": "free", "lat": 12.9171, "lng": 77.4821 },
  { "name": "Banashankari BDA Ground", "area": "Banashankari", "type": "free", "lat": 12.9245, "lng": 77.5604 },
  { "name": "Vijaynagar BDA Ground", "area": "Vijaynagar", "type": "free", "lat": 12.9725, "lng": 77.5321 },
  { "name": "Rajajinagar Playground", "area": "Rajajinagar", "type": "free", "lat": 12.9933, "lng": 77.5533 },
  { "name": "Malleswaram Ground", "area": "Malleswaram", "type": "free", "lat": 13.0032, "lng": 77.5698 },
  { "name": "Sankey Tank Ground", "area": "Sadashivanagar", "type": "free", "lat": 13.0094, "lng": 77.5733 },
  { "name": "Hebbal BBMP Ground", "area": "Hebbal", "type": "free", "lat": 13.0361, "lng": 77.6009 },
  { "name": "Jayanagar 4th Block Ground", "area": "Jayanagar", "type": "free", "lat": 12.9297, "lng": 77.5844 },
  { "name": "Green Sports Arena", "area": "Marathahalli", "type": "paid", "lat": 12.9569, "lng": 77.7013 },
  { "name": "Smasher Sports Arena", "area": "KR Puram", "type": "paid", "lat": 13.0013, "lng": 77.7238 },
  { "name": "Dommasandra Sports Turf", "area": "Dommasandra", "type": "paid", "lat": 12.8587, "lng": 77.7285 },
  { "name": "Sathanur Turf Zone", "area": "Whitefield", "type": "paid", "lat": 12.9861, "lng": 77.7501 },
  { "name": "Turf Town Whitefield", "area": "Whitefield", "type": "paid", "lat": 12.9693, "lng": 77.7509 },
  { "name": "Game Theory Sports Arena", "area": "HSR Layout", "type": "paid", "lat": 12.9128, "lng": 77.6419 },
  { "name": "Bellandur Lake View Ground", "area": "Bellandur", "type": "mixed", "lat": 12.9274, "lng": 77.6768 },
  { "name": "Indiranagar BBMP Ground", "area": "Indiranagar", "type": "free", "lat": 12.9720, "lng": 77.6401 },
  { "name": "Domlur Club Ground", "area": "Domlur", "type": "mixed", "lat": 12.9602, "lng": 77.6371 },
  { "name": "Murphy Town Ground", "area": "Ulsoor", "type": "free", "lat": 12.9830, "lng": 77.6289 },
  { "name": "VV Puram College Ground", "area": "VV Puram", "type": "mixed", "lat": 12.9531, "lng": 77.5732 },
  { "name": "Banaswadi Public Ground", "area": "Banaswadi", "type": "free", "lat": 13.0145, "lng": 77.6511 },
  { "name": "Kalyan Nagar Ground", "area": "Kalyan Nagar", "type": "free", "lat": 13.0185, "lng": 77.6489 },
  { "name": "HRBR Layout Ground", "area": "HRBR Layout", "type": "free", "lat": 13.0188, "lng": 77.6438 },
  { "name": "Doddanekundi Ground", "area": "Doddanekundi", "type": "free", "lat": 12.9772, "lng": 77.6959 },
  { "name": "Brookefield Public Ground", "area": "Brookefield", "type": "free", "lat": 12.9690, "lng": 77.7170 },
  { "name": "Kadubeesanahalli Ground", "area": "Kadubeesanahalli", "type": "free", "lat": 12.9342, "lng": 77.6944 },
  { "name": "Munnekolala Lake Ground", "area": "Marathahalli", "type": "free", "lat": 12.9598, "lng": 77.7060 },
  { "name": "Tin Factory Ground", "area": "KR Puram", "type": "free", "lat": 12.9950, "lng": 77.6800 },
  { "name": "Horamavu Agara Ground", "area": "Horamavu", "type": "free", "lat": 13.0251, "lng": 77.6670 }
];

// 3) === SARJAPUR-SIDE +50 GROUNDS ===
const sarjapurExtraGrounds = [
  { "name": "Spartan Sports Arena", "area": "Sarjapur Road", "type": "paid", "lat": 12.9027, "lng": 77.7054 },
  { "name": "Cowel Sports Arena", "area": "Kaikondrahalli", "type": "paid", "lat": 12.9129, "lng": 77.6852 },
  { "name": "Cowel Pro Arena 2", "area": "Kasavanahalli", "type": "paid", "lat": 12.9064, "lng": 77.6832 },
  { "name": "Eagles Turf Sarjapur", "area": "Dommasandra", "type": "paid", "lat": 12.8594, "lng": 77.7341 },
  { "name": "Victory Sports Turf", "area": "Sarjapur Road", "type": "paid", "lat": 12.8965, "lng": 77.7009 },
  { "name": "Cricket Adda Turf", "area": "Choodasandra", "type": "paid", "lat": 12.8808, "lng": 77.6972 },
  { "name": "Urban Cricket Arena", "area": "Hadosiddapura", "type": "paid", "lat": 12.8982, "lng": 77.7003 },
  { "name": "HSR Sports Arena (Sarjapura Branch)", "area": "Kaikondrahalli", "type": "paid", "lat": 12.9180, "lng": 77.6865 },
  { "name": "Offload Sports Arena", "area": "Gunjur", "type": "paid", "lat": 12.9390, "lng": 77.7324 },
  { "name": "Gunjur Public Ground", "area": "Gunjur", "type": "free", "lat": 12.9415, "lng": 77.7312 },
  { "name": "Dommasandra Government School Ground", "area": "Dommasandra", "type": "free", "lat": 12.8590, "lng": 77.7351 },
  { "name": "Kodathi Lake View Ground", "area": "Kodathi", "type": "free", "lat": 12.8842, "lng": 77.7225 },
  { "name": "Wipro Kodathi Ground", "area": "Kodathi", "type": "mixed", "lat": 12.8870, "lng": 77.7200 },
  { "name": "Yamare Village Sports Field", "area": "Yamare", "type": "free", "lat": 12.8627, "lng": 77.7507 },
  { "name": "Yamare Turf Arena", "area": "Yamare", "type": "paid", "lat": 12.8615, "lng": 77.7488 },
  { "name": "Kasavanahalli Lake Ground", "area": "Kasavanahalli", "type": "free", "lat": 12.9055, "lng": 77.6879 },
  { "name": "Chikka Haralur School Ground", "area": "Haralur", "type": "free", "lat": 12.8953, "lng": 77.6684 },
  { "name": "Haralur Public Playground", "area": "Haralur", "type": "free", "lat": 12.9000, "lng": 77.6692 },
  { "name": "Kasavanahalli 'PowerPlay' Turf", "area": "Kasavanahalli", "type": "paid", "lat": 12.9031, "lng": 77.6858 },
  { "name": "D35 Turf Park", "area": "Kaikondrahalli", "type": "paid", "lat": 12.9152, "lng": 77.6873 },
  { "name": "Sarjapura Attibele Farm Ground", "area": "Attibele Road", "type": "mixed", "lat": 12.8157, "lng": 77.7391 },
  { "name": "Dommasandra Lake Bed Ground", "area": "Dommasandra", "type": "free", "lat": 12.8610, "lng": 77.7322 },
  { "name": "Sarjapur New Cricket Ground", "area": "Sarjapur Town", "type": "free", "lat": 12.8574, "lng": 77.7820 },
  { "name": "Gunjur Legala Farm Ground", "area": "Gunjur", "type": "mixed", "lat": 12.9380, "lng": 77.7399 },
  { "name": "Hadosiddapura Mud Ground", "area": "Hadosiddapura", "type": "free", "lat": 12.8988, "lng": 77.7033 },
  { "name": "Varthur Kodi Lakeside Ground", "area": "Varthur", "type": "free", "lat": 12.9565, "lng": 77.7438 },
  { "name": "Varthur Government School Ground", "area": "Varthur", "type": "free", "lat": 12.9588, "lng": 77.7470 },
  { "name": "Varthur New Turf Arena", "area": "Varthur", "type": "paid", "lat": 12.9577, "lng": 77.7406 },
  { "name": "Balagere Playground", "area": "Balagere", "type": "free", "lat": 12.9791, "lng": 77.7364 },
  { "name": "Gunjur Palya Ground", "area": "Gunjur Palya", "type": "free", "lat": 12.9428, "lng": 77.7230 },
  { "name": "Saibaba Layout Ground", "area": "Haralur", "type": "free", "lat": 12.9045, "lng": 77.6712 },
  { "name": "Springfield Society Ground", "area": "Kaikondrahalli", "type": "mixed", "lat": 12.9122, "lng": 77.6868 },
  { "name": "SJR Verity Backside Ground", "area": "Kasavanahalli", "type": "free", "lat": 12.9113, "lng": 77.6872 },
  { "name": "Doddakannelli Public Ground", "area": "Doddakannelli", "type": "free", "lat": 12.9170, "lng": 77.7050 },
  { "name": "Doddakannelli School Ground", "area": "Doddakannelli", "type": "free", "lat": 12.9188, "lng": 77.7074 },
  { "name": "Carmelaram Church Ground", "area": "Carmelaram", "type": "free", "lat": 12.9264, "lng": 77.7134 },
  { "name": "Ambedkar Nagar Ground", "area": "Choodasandra", "type": "free", "lat": 12.8788, "lng": 77.6982 },
  { "name": "Muthanallur Road Turf Arena", "area": "Muthanallur", "type": "paid", "lat": 12.8493, "lng": 77.7228 },
  { "name": "Gowrenahalli Open Ground", "area": "Gowrenahalli", "type": "free", "lat": 12.8547, "lng": 77.7449 },
  { "name": "Chikka Yamare Ground", "area": "Chikka Yamare", "type": "free", "lat": 12.8671, "lng": 77.7514 },
  { "name": "Amrita School Ground", "area": "Kasavanahalli", "type": "free", "lat": 12.9085, "lng": 77.6841 },
  { "name": "TS Turf Arena", "area": "Kaikondrahalli", "type": "paid", "lat": 12.9138, "lng": 77.6887 },
  { "name": "FireFox Sports Arena", "area": "Sarjapur Road", "type": "paid", "lat": 12.9018, "lng": 77.7043 },
  { "name": "Champion's Nest Turf", "area": "Hadosiddapura", "type": "paid", "lat": 12.8994, "lng": 77.6990 },
  { "name": "Kings Sports Arena", "area": "Sarjapur Attibele Road", "type": "paid", "lat": 12.8247, "lng": 77.7387 },
  { "name": "RGA Tech Park Ground", "area": "Gunjur", "type": "mixed", "lat": 12.9458, "lng": 77.7275 },
  { "name": "Pratham International School Ground", "area": "Gunjur", "type": "free", "lat": 12.9418, "lng": 77.7349 },
  { "name": "Vibgyor High Sarjapur Ground", "area": "Gunjur", "type": "mixed", "lat": 12.9384, "lng": 77.7255 },
  { "name": "Maple Sports Arena", "area": "Sarjapur Road", "type": "paid", "lat": 12.8983, "lng": 77.7065 },
  { "name": "Team Play Turf Sarjapur", "area": "Sarjapur Road", "type": "paid", "lat": 12.8947, "lng": 77.7032 }
];

// 4) === +100 MORE GROUNDS (South, East, Whitefield, North) ===
const extraGrounds = [
  // SOUTH BANGALORE (25)
  { "name": "JP Nagar 6th Phase BBMP Ground", "area": "JP Nagar", "type": "free", "lat": 12.9005, "lng": 77.5798 },
  { "name": "JP Nagar 7th Phase Park Ground", "area": "JP Nagar", "type": "free", "lat": 12.8962, "lng": 77.5790 },
  { "name": "JP Nagar Brigade Millennium Ground", "area": "JP Nagar", "type": "mixed", "lat": 12.8904, "lng": 77.5869 },
  { "name": "JP Nagar Mini Forest Ground", "area": "JP Nagar", "type": "free", "lat": 12.9172, "lng": 77.5830 },
  { "name": "Puttenahalli Lake Ground", "area": "JP Nagar", "type": "free", "lat": 12.8985, "lng": 77.5827 },
  { "name": "BTM 2nd Stage Park Ground", "area": "BTM", "type": "free", "lat": 12.9155, "lng": 77.6060 },
  { "name": "BTM 4th Stage Playground", "area": "BTM", "type": "free", "lat": 12.9044, "lng": 77.6025 },
  { "name": "Arekere Mico Layout Ground", "area": "Bannerghatta Road", "type": "free", "lat": 12.8842, "lng": 77.5981 },
  { "name": "Meenakshi Temple Road Ground", "area": "Bannerghatta Road", "type": "free", "lat": 12.8797, "lng": 77.6004 },
  { "name": "Arakere Lake Bed Ground", "area": "Bannerghatta Road", "type": "free", "lat": 12.8780, "lng": 77.5963 },
  { "name": "Uttarahalli Lake Ground", "area": "Uttarahalli", "type": "free", "lat": 12.9125, "lng": 77.5492 },
  { "name": "Chikkalsandra Playground", "area": "Chikkalsandra", "type": "free", "lat": 12.9230, "lng": 77.5477 },
  { "name": "Banashankari 3rd Stage Ground", "area": "Banashankari", "type": "free", "lat": 12.9238, "lng": 77.5555 },
  { "name": "Hosakerehalli BDA Ground", "area": "Hosakerehalli", "type": "free", "lat": 12.9350, "lng": 77.5431 },
  { "name": "Kumaraswamy Layout BBMP Ground", "area": "Kumaraswamy Layout", "type": "free", "lat": 12.9078, "lng": 77.5570 },
  { "name": "KSIT Engineering College Ground", "area": "Kanakapura Road", "type": "paid", "lat": 12.8827, "lng": 77.5640 },
  { "name": "Talaghattapura Open Field", "area": "Kanakapura Road", "type": "free", "lat": 12.8543, "lng": 77.5452 },
  { "name": "Anjanapura Township Ground", "area": "Anjanapura", "type": "free", "lat": 12.8665, "lng": 77.5490 },
  { "name": "Konanakunte Cross Ground", "area": "Konanakunte", "type": "free", "lat": 12.8908, "lng": 77.5584 },
  { "name": "Gottigere Village Ground", "area": "Gottigere", "type": "free", "lat": 12.8489, "lng": 77.5960 },
  { "name": "Royal Meenakshi Mall Backside Ground", "area": "Bannerghatta Road", "type": "mixed", "lat": 12.8775, "lng": 77.6025 },
  { "name": "Valachery Sports Farm (BG Road)", "area": "Bannerghatta Road", "type": "paid", "lat": 12.8642, "lng": 77.6022 },
  { "name": "Begur Koppa Road Farm Ground", "area": "Begur", "type": "mixed", "lat": 12.8640, "lng": 77.6335 },
  { "name": "Arekere Reserved Forest Edge Ground", "area": "Bannerghatta Road", "type": "free", "lat": 12.8718, "lng": 77.5950 },
  { "name": "Anjaneya Temple Ground JP Nagar", "area": "JP Nagar", "type": "free", "lat": 12.9091, "lng": 77.5802 },

  // EAST BANGALORE (25)
  { "name": "Kaggadasapura Lake Ground", "area": "Kaggadasapura", "type": "free", "lat": 12.9855, "lng": 77.6762 },
  { "name": "Kaggadasapura BBMP Playground", "area": "Kaggadasapura", "type": "free", "lat": 12.9870, "lng": 77.6795 },
  { "name": "CV Raman Nagar DRDO Ground", "area": "CV Raman Nagar", "type": "mixed", "lat": 12.9850, "lng": 77.6647 },
  { "name": "CV Raman Nagar Park Ground", "area": "CV Raman Nagar", "type": "free", "lat": 12.9877, "lng": 77.6670 },
  { "name": "BEML Layout 4th Stage Ground", "area": "BEML Layout", "type": "free", "lat": 12.9896, "lng": 77.6715 },
  { "name": "GM Palya Playground", "area": "GM Palya", "type": "free", "lat": 12.9822, "lng": 77.6698 },
  { "name": "Malleshpalya Open Ground", "area": "Malleshpalya", "type": "free", "lat": 12.9859, "lng": 77.6727 },
  { "name": "Doddanekkundi Lake Park Ground", "area": "Doddanekundi", "type": "free", "lat": 12.9805, "lng": 77.6990 },
  { "name": "Mahadevapura BBMP Ground", "area": "Mahadevapura", "type": "free", "lat": 12.9912, "lng": 77.6968 },
  { "name": "Mahadevapura Lake Bed Ground", "area": "Mahadevapura", "type": "free", "lat": 12.9969, "lng": 77.6910 },
  { "name": "KR Puram Hanging Bridge Ground", "area": "KR Puram", "type": "free", "lat": 13.0055, "lng": 77.6925 },
  { "name": "KR Puram Ayyappa Layout Ground", "area": "KR Puram", "type": "free", "lat": 13.0081, "lng": 77.6975 },
  { "name": "Ramamurthy Nagar BBMP Ground", "area": "Ramamurthy Nagar", "type": "free", "lat": 13.0178, "lng": 77.6708 },
  { "name": "TC Palya Main Road Ground", "area": "TC Palya", "type": "free", "lat": 13.0241, "lng": 77.6919 },
  { "name": "Kalkere Lake View Ground", "area": "Kalkere", "type": "free", "lat": 13.0207, "lng": 77.6808 },
  { "name": "Channasandra Public Field", "area": "Channasandra", "type": "free", "lat": 13.0225, "lng": 77.7115 },
  { "name": "Horamavu Railway Parallel Ground", "area": "Horamavu", "type": "free", "lat": 13.0282, "lng": 77.6591 },
  { "name": "Battarahalli Open Ground", "area": "Battarahalli", "type": "free", "lat": 13.0069, "lng": 77.7051 },
  { "name": "KR Puram Cable Bridge Turf Arena", "area": "KR Puram", "type": "paid", "lat": 13.0039, "lng": 77.6977 },
  { "name": "Mahadevapura Turf Arena", "area": "Mahadevapura", "type": "paid", "lat": 12.9977, "lng": 77.7010 },
  { "name": "Indiranagar 100ft Road School Ground", "area": "Indiranagar", "type": "mixed", "lat": 12.9740, "lng": 77.6390 },
  { "name": "Ulsoor Lake Side Ground 2", "area": "Ulsoor", "type": "free", "lat": 12.9839, "lng": 77.6235 },
  { "name": "Halasuru BDA Complex Ground", "area": "Ulsoor", "type": "free", "lat": 12.9823, "lng": 77.6195 },
  { "name": "Old Madras Road Playground", "area": "Old Madras Road", "type": "free", "lat": 12.9872, "lng": 77.6275 },
  { "name": "Byappanahalli Metro Side Ground", "area": "Byappanahalli", "type": "free", "lat": 12.9965, "lng": 77.6408 },

  // WHITEFIELD SIDE (25)
  { "name": "ITPL Tech Park Ground", "area": "Whitefield", "type": "mixed", "lat": 12.9844, "lng": 77.7281 },
  { "name": "ITPL Back Gate Ground", "area": "Whitefield", "type": "free", "lat": 12.9861, "lng": 77.7320 },
  { "name": "Graphite India Ground", "area": "Whitefield", "type": "free", "lat": 12.9822, "lng": 77.7149 },
  { "name": "Kadugodi Tree Park Ground", "area": "Kadugodi", "type": "free", "lat": 13.0063, "lng": 77.7583 },
  { "name": "Kadugodi Public School Ground", "area": "Kadugodi", "type": "free", "lat": 13.0085, "lng": 77.7540 },
  { "name": "Belathur Village Ground", "area": "Belathur", "type": "free", "lat": 13.0147, "lng": 77.7710 },
  { "name": "Hope Farm Signal Ground", "area": "Whitefield", "type": "free", "lat": 12.9912, "lng": 77.7511 },
  { "name": "Hoodi Circle Ground 2", "area": "Hoodi", "type": "free", "lat": 12.9979, "lng": 77.7178 },
  { "name": "Hoodi Lake View Ground", "area": "Hoodi", "type": "free", "lat": 12.9999, "lng": 77.7211 },
  { "name": "Seegehalli Lake Bed Ground", "area": "Seegehalli", "type": "free", "lat": 13.0132, "lng": 77.7429 },
  { "name": "Avalahalli State Ground", "area": "Avalahalli (Whitefield side)", "type": "free", "lat": 13.0215, "lng": 77.7651 },
  { "name": "Varthur Kodi Ground 2", "area": "Varthur", "type": "free", "lat": 12.9545, "lng": 77.7445 },
  { "name": "Gunjur Plantation Farm Ground", "area": "Gunjur", "type": "mixed", "lat": 12.9405, "lng": 77.7382 },
  { "name": "Whitefield Global School Ground", "area": "Whitefield", "type": "mixed", "lat": 12.9942, "lng": 77.7560 },
  { "name": "Channasandra Lake Turf Arena", "area": "Channasandra", "type": "paid", "lat": 13.0262, "lng": 77.7147 },
  { "name": "Kadugodi Turf Arena", "area": "Kadugodi", "type": "paid", "lat": 13.0125, "lng": 77.7622 },
  { "name": "Hope Farm Premium Turf", "area": "Whitefield", "type": "paid", "lat": 12.9925, "lng": 77.7488 },
  { "name": "Whitefield Main Road TurfBox", "area": "Whitefield", "type": "paid", "lat": 12.9818, "lng": 77.7423 },
  { "name": "Seegehalli Turf Park", "area": "Seegehalli", "type": "paid", "lat": 13.0100, "lng": 77.7485 },
  { "name": "Sadaramangala Industrial Ground", "area": "Sadaramangala", "type": "mixed", "lat": 13.0005, "lng": 77.7322 },
  { "name": "Borewell Road Community Ground", "area": "Whitefield", "type": "free", "lat": 12.9697, "lng": 77.7493 },
  { "name": "ECC Road Lake Ground", "area": "Whitefield", "type": "free", "lat": 12.9743, "lng": 77.7377 },
  { "name": "Vydehi School Ground", "area": "Whitefield", "type": "mixed", "lat": 12.9818, "lng": 77.7320 },
  { "name": "Immadihalli Village Ground", "area": "Immadi Halli", "type": "free", "lat": 12.9987, "lng": 77.7608 },
  { "name": "Immadi Halli Turf Arena", "area": "Immadi Halli", "type": "paid", "lat": 12.9965, "lng": 77.7568 },

  // NORTH BANGALORE (25)
  { "name": "Yelahanka New Town 4th Phase Ground", "area": "Yelahanka", "type": "free", "lat": 13.1042, "lng": 77.5860 },
  { "name": "Yelahanka New Town BBMP Ground", "area": "Yelahanka", "type": "free", "lat": 13.0988, "lng": 77.5852 },
  { "name": "Yelahanka NES Playground", "area": "Yelahanka", "type": "free", "lat": 13.0971, "lng": 77.5935 },
  { "name": "Allalsandra Lake View Ground", "area": "Allalsandra", "type": "free", "lat": 13.0948, "lng": 77.5808 },
  { "name": "Judicial Layout Ground", "area": "Yelahanka", "type": "free", "lat": 13.0959, "lng": 77.5711 },
  { "name": "Sahakar Nagar H Block Ground", "area": "Sahakar Nagar", "type": "free", "lat": 13.0655, "lng": 77.5813 },
  { "name": "Sahakar Nagar Park Ground", "area": "Sahakar Nagar", "type": "free", "lat": 13.0691, "lng": 77.5800 },
  { "name": "Kodigehalli BBMP Playground", "area": "Kodigehalli", "type": "free", "lat": 13.0531, "lng": 77.5741 },
  { "name": "Thindlu Village Ground", "area": "Thindlu", "type": "free", "lat": 13.0692, "lng": 77.5639 },
  { "name": "Jakkur Aerodrome Backside Ground", "area": "Jakkur", "type": "free", "lat": 13.0829, "lng": 77.5925 },
  { "name": "Nagawara Lake Park Ground", "area": "Nagawara", "type": "free", "lat": 13.0399, "lng": 77.6275 },
  { "name": "Manyata Tech Park Inner Ground", "area": "Nagawara", "type": "mixed", "lat": 13.0390, "lng": 77.6205 },
  { "name": "RK Hegde Nagar Ground", "area": "RK Hegde Nagar", "type": "free", "lat": 13.0681, "lng": 77.6427 },
  { "name": "Kothanur Village Playground", "area": "Kothanur", "type": "free", "lat": 13.0700, "lng": 77.6463 },
  { "name": "Hennur Bande Lake Ground", "area": "Hennur", "type": "free", "lat": 13.0365, "lng": 77.6472 },
  { "name": "Lingarajapuram Railway Ground", "area": "Lingarajapuram", "type": "free", "lat": 13.0107, "lng": 77.6279 },
  { "name": "RT Nagar Post Office Ground", "area": "RT Nagar", "type": "free", "lat": 13.0140, "lng": 77.5940 },
  { "name": "RT Nagar Police Station Ground", "area": "RT Nagar", "type": "free", "lat": 13.0182, "lng": 77.5932 },
  { "name": "Ganganagar Playground", "area": "Ganganagar", "type": "free", "lat": 13.0208, "lng": 77.5910 },
  { "name": "Boopsandra Lake Side Ground", "area": "Boopsandra", "type": "free", "lat": 13.0293, "lng": 77.5781 },
  { "name": "Yeshwanthpur Open Ground", "area": "Yeshwanthpur", "type": "free", "lat": 13.0257, "lng": 77.5405 },
  { "name": "Peenya Industrial Ground", "area": "Peenya", "type": "mixed", "lat": 13.0285, "lng": 77.5118 },
  { "name": "Jalahalli Cross Ground", "area": "Jalahalli", "type": "free", "lat": 13.0511, "lng": 77.5266 },
  { "name": "BEL Colony Sports Ground", "area": "Jalahalli", "type": "mixed", "lat": 13.0525, "lng": 77.5460 },
  { "name": "HMT Layout Park Ground", "area": "Jalahalli", "type": "free", "lat": 13.0465, "lng": 77.5488 }
];

// 5) MERGED LIST
const grounds = [...baseGrounds, ...sarjapurExtraGrounds, ...extraGrounds]; // 75 + 50 + 100 = 225

// 6) Seed function
async function seedGrounds() {
  console.log(`Seeding ${grounds.length} grounds...`);
  
  const batch = db.batch();
  
  grounds.forEach((g) => {
    const ref = db.collection("grounds").doc(); // auto-id
    batch.set(ref, {
      name: g.name,
      area: g.area,
      type: g.type,
      lat: g.lat,
      lng: g.lng,
      city: "Bengaluru",
      source: "seed",
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  console.log("Done ✅");
  process.exit(0);
}

seedGrounds().catch((err) => {
  console.error(err);
  process.exit(1);
});

