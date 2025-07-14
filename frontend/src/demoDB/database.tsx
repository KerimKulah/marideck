
export const customers = [
    {
        id: 1,
        companyName: "Yılmazlar Denizcilik A.Ş.",
        contactPerson: "Ahmet Yılmazddddddasdsda",
        email: "ahmet@yilmazlardenizcilik.com",
        phone: "+90 555 123 4567",
        companyType: "Gemi Acentesi",
        country: "Türkiye",
        lastTransaction: "2025-06-20T14:30:00"
    },
    {
        id: 2,
        companyName: "Kaya İnşaat Ltd. Şti.",
        contactPerson: "Ayşe Kaya",
        email: "ayse@kayainsaat.com",
        phone: "+90 555 987 6543",
        companyType: "İnşaat Firması",
        country: "Türkiye",
        lastTransaction: "2025-06-18T11:20:00"
    },
    {
        id: 3,
        companyName: "Demir Metal San. ve Tic. A.Ş.",
        contactPerson: "Mehmet Demir",
        email: "mehmet@demirmetal.com",
        phone: "+90 555 456 7890",
        companyType: "İhracatçı",
        country: "Türkiye",
        lastTransaction: "2025-06-15T09:45:00"
    },
    {
        id: 4,
        companyName: "Global Shipping Inc.",
        contactPerson: "John Smith",
        email: "john@globalshipping.com",
        phone: "+1 555 123 4567",
        companyType: "Gemi İşletmecisi",
        country: "ABD",
        lastTransaction: "2025-06-19T16:20:00"
    },
    {
        id: 5,
        companyName: "Mediterranean Trading Co.",
        contactPerson: "Maria Garcia",
        email: "maria@medtrading.com",
        phone: "+34 555 123 456",
        companyType: "İthalatçı",
        country: "İspanya",
        lastTransaction: "2025-06-17T10:15:00"
    },
    {
        id: 6,
        companyName: "Nordic Logistics AB",
        contactPerson: "Lars Svensson",
        email: "lars@nordiclogistics.se",
        phone: "+46 555 112 233",
        companyType: "Lojistik Firması",
        country: "İsveç",
        lastTransaction: "2025-06-21T13:05:00"
    },
    {
        id: 7,
        companyName: "GreenTech Enerji Ltdasdasdasdsadasdasdsadas .",
        contactPerson: "Zeynep Aksoy",
        email: "zeynep@greentech.com",
        phone: "+90 555 678 9012",
        companyType: "Enerji Şirketi",
        country: "Türkiye",
        lastTransaction: "2025-06-22T08:45:00"
    },
    {
        id: 8,
        companyName: "Ocean Freight LLC",
        contactPerson: "James Brown",
        email: "james@oceanfreight.com",
        phone: "+1 555 987 6543",
        companyType: "Gemi Taşımacılığı",
        country: "Amerika Birleşik Devletleri",
        lastTransaction: "2025-06-20T12:30:00"
    },
];

export const ships = [
    {
        id: 1,
        name: "M/V Atlantic Star",
        imo: 9876543,
        source: "manual",
        type: "Tanker",
        length: "120",
        flag: "Türkiye",
        departurePort: "Ambarli",
        currentPort: "Ambarli",
        nextPort: "Piraeus",
        eta: "2025-06-22T08:00:00",
        etd: "2025-06-24T18:00:00",
        status: "devam",
        agency: "Deniz Acentelik",
        operator: "Mediterranean Shipping Company",
        updatedAt: "2025-06-22T08:45:00",
        customer: customers[0]
    },
    {
        id: 2,
        name: "M/V Pacific Dawn",
        imo: 8765432,
        source: "ais",
        type: "Container",
        length: "120",
        flag: "Türkiye",
        departurePort: "Haydarpaşa",
        currentPort: "Haydarpaşa",
        nextPort: "Istanbul",
        eta: "2025-06-25T10:00:00",
        etd: "2025-06-27T16:00:00",
        status: "beklemede",
        agency: "Ege Denizcilik",
        operator: "Pacific Carriers",
        updatedAt: "2025-06-22T08:45:00",
        customer: customers[1]
    },
    {
        id: 3,
        name: "M/V Mediterranean Queen",
        imo: 7654321,
        source: "ais",
        type: "Container",
        length: "120",
        flag: "Türkiye",
        departurePort: "Diliskelesi",
        currentPort: "Diliskelesi",
        nextPort: "Mersin",
        eta: "2025-06-20T14:00:00",
        etd: "2025-06-21T20:00:00",
        status: "tamamlandı",
        agency: "Akdeniz Acentelik",
        operator: "Teekay Shipping",
        updatedAt: "2025-06-22T08:45:00",
        customer: customers[2]
    },
    {
        id: 4,
        name: "M/V Nordic Voyager",
        imo: 6543210,
        source: "manual",
        type: "Container",
        length: "120",
        flag: "Türkiye",
        departurePort: "Iskenderun",
        currentPort: "Iskenderun",
        nextPort: "Istanbul",
        eta: "2025-06-23T09:00:00",
        etd: "2025-06-25T15:00:00",
        status: "devam",
        agency: "Karadeniz Acentelik",
        operator: "Nordic Tankers",
        updatedAt: "2025-06-22T08:45:00",
        customer: customers[3]
    },
    {
        id: 5,
        name: "M/V Blue Horizon",
        imo: 9506291,
        source: "manual",
        type: "Bulk Carrier",
        length: "120",
        flag: "Finland",
        departurePort: "Mersin",
        currentPort: "Mersin",
        nextPort: "Antalya",
        eta: "2025-06-21T11:00:00",
        etd: "2025-06-22T17:00:00",
        status: "devam",
        agency: "Akdeniz Acentelik",
        operator: "Blue Horizon Shipping",
        updatedAt: "2025-06-22T08:45:00",
        customer: customers[4]
    }
]

export const operations = [
    {
        id: 1,
        ship_id: 1,
        status: "devam",


    }
]
