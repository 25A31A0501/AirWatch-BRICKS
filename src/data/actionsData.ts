import { ClimateAction } from "../types";

export const CLIMATE_ACTIONS: ClimateAction[] = [
  {
    id: "action-1",
    title: "Avoid open burning",
    description: "Keep leaves and waste out of the fire. Use collection services instead.",
    iconName: "Flame",
    category: "Waste & Fire Prevention",
    impactScore: "High Impact (-35kg PM2.5/yr)",
    steps: [
      "Bag dry leaves and garden mulch separately for municipal organic composting.",
      "Never incinerate plastic bags, tires, or synthetic packaging at domestic or commercial premises.",
      "Report illegal street burning to local sanitation wardens or via the AirWatch citizen hotline.",
      "Utilize community bio-digesters or local vermicompost pits for green waste management."
    ],
    tips: [
      "Open burning releases dioxins, furans, and ultra-fine black carbon.",
      "Mulching garden clippings enriches soil moisture and avoids all airborne particulate matter."
    ],
    hotline: "1800-425-WASTE (Toll-Free Municipal Clean Air Line)"
  },
  {
    id: "action-2",
    title: "Choose cleaner travel",
    description: "Share a ride, take transit, or walk for short journeys.",
    iconName: "Car",
    category: "Mobility & Transit",
    impactScore: "Medium Impact (-18kg NO2/mo)",
    steps: [
      "Adopt metro rail, electric buses, or organized carpools for peak morning commutes.",
      "Maintain optimal tire pressure and routine engine emission checks (PUC certification).",
      "Avoid prolonged engine idling at railway crossings and traffic signals over 30 seconds.",
      "Switch to active mobility (cycling or walking) for trips under 2 kilometers."
    ],
    tips: [
      "A full electric bus replaces up to 40 individual personal petrol vehicles on the road.",
      "Turning off your engine while idling saves fuel and immediately protects pedestrian lung zones."
    ],
    hotline: "Clean Transit Desk: transit@airwatch.brics.org"
  },
  {
    id: "action-3",
    title: "Protect farm air",
    description: "Compost or recycle crop waste instead of burning it.",
    iconName: "Wheat",
    category: "Agriculture & Land Use",
    impactScore: "Severe Regional Impact (-120kg PM/acre)",
    steps: [
      "Apply microbial bio-decomposer solutions (such as Pusa decomposer) directly on stubble.",
      "Utilize Happy Seeder or Super-SMS machinery for in-situ straw incorporation without burning.",
      "Bale crop residue for supply to regional biomass power plants and eco-packaging converters.",
      "Connect with local agricultural extension offices for subsidized machinery rentals."
    ],
    tips: [
      "Crop residue contains rich nitrogen and phosphorus that regenerates topsoil when tilled back.",
      "Stubble smoke forms long-range atmospheric hazes that impact millions in downwind valleys."
    ],
    hotline: "Agri-Clean Air Hotline: 1800-180-AGRI"
  },
  {
    id: "action-4",
    title: "Sort your waste",
    description: "A small change that keeps useful materials out of fires.",
    iconName: "Recycle",
    category: "Resource Recovery",
    impactScore: "High Impact (-45kg Methane/yr)",
    steps: [
      "Segregate household waste into Wet (organic), Dry (recyclable), and Sanitary/Hazardous streams.",
      "Rinse plastic milk packets and metal cans before depositing in dry recycling bins.",
      "Hand over e-waste and lithium batteries exclusively to authorized recycling depots.",
      "Refuse single-use polythene bags and carry reusable cotton canvas totes."
    ],
    tips: [
      "Mixed unsorted waste in open landfills generates spontaneous methane fires that smolder for weeks.",
      "Properly sorted dry materials are 90% recoverable and keep toxic plastics away from incinerators."
    ],
    hotline: "Zero Waste Helpline: waste-zero@airwatch.brics.org"
  },
  {
    id: "action-5",
    title: "Grow local greenery",
    description: "Trees and plants help cool streets and improve air quality.",
    iconName: "Leaf",
    category: "Urban Forestry",
    impactScore: "Long-term Bio-filtration (+500kg O2/yr)",
    steps: [
      "Plant indigenous broadleaf trees (such as Neem, Peepal, Ashoka, or Jacaranda) along building perimeters.",
      "Create vertical balcony micro-gardens with air-purifying foliage like Snake Plants, Areca Palms, and Peace Lilies.",
      "Participate in urban neighborhood pocket forest (Miyawaki) afforestation drives.",
      "Support municipal green belts and unpaved permeable soil borders around tree trunks."
    ],
    tips: [
      "Leaf surface micro-structures trap airborne dust particles and lower surface temperatures by 3-5°C.",
      "Dense canopy belts act as natural sound and particulate baffles against expressway emissions."
    ],
    hotline: "Urban Tree Council: green@airwatch.brics.org"
  },
  {
    id: "action-6",
    title: "Report emissions",
    description: "See suspicious industrial smoke? Send a report so authorities can investigate.",
    iconName: "AlertTriangle",
    category: "Citizen Oversight",
    impactScore: "Critical Enforcement Catalyst",
    steps: [
      "Capture clear geolocated photos or video of active industrial plumes or night-time burning.",
      "Submit instant details via the BRICS AirWatch 'Report Pollution' portal.",
      "Note down odor characteristics (e.g. rotten eggs, burning rubber, chemical sweet, metallic).",
      "Follow up on incident status through the transparent AI verification and Government response desk."
    ],
    tips: [
      "Over 70% of fugitive industrial nocturnal violations are uncovered through prompt citizen alerts.",
      "Your reports feed into AI triangulation that triggers automated statutory inspection protocols."
    ],
    hotline: "Citizen Rapid Alert: airwatch-alert@brics.org"
  }
];
