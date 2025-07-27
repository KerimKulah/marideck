
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
        mmsi: "636022113",
        callSign: "ABCDE",
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
        mmsi: "636022113",
        callSign: "FGHIJ",
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
        mmsi: "636022113",
        imo: 7654321,
        callSign: "KLMNO",
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
        mmsi: "636022113",
        imo: 6543210,
        callSign: "PQRST",
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
        mmsi: "636022113",
        imo: 9506291,
        callSign: "UVWXY",
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
        "name": "Akdeniz Limanı Operasyonu",
        "type": "Yükleme",
        "details": "Konşimento numarası 123456 ile konteyner yükleme işlemi",
        "port": "İzmir Limanı",
        "customer": { "id": 5 },
        "users": [{ "id": 2 }, { "id": 7 }],
        "ship": { "id": 3 },
        "operationLogs": [{ "id": 10 }, { "id": 11 }],
        "startDate": "2025-07-20T08:00:00Z",
        "endDate": "2025-07-22T18:00:00Z",
        "status": "Aktif",
        "cargoType": "Konteyner",
        "cargoDetails": "Elektronik ürünler, 100 adet",
        "createdAt": "2025-07-18T10:15:00Z",
        "updatedAt": "2025-07-19T12:00:00Z",
        "deletedAt": null
    },
    {
        "name": "Konteyner Boşaltma",
        "type": "Boşaltma",
        "details": "Roro gemisinden konteyner boşaltma işlemi gerçekleştiriliyor",
        "port": "İstanbul Limanı",
        "customer": { "id": 12 },
        "users": [{ "id": 4 }],
        "ship": { "id": 8 },
        "operationLogs": [],
        "startDate": "2025-08-01T06:30:00Z",
        "endDate": "2025-08-01T14:00:00Z",
        "status": "Tamamlandı",
        "cargoType": "Roro",
        "cargoDetails": "Otomobiller, 50 adet",
        "createdAt": "2025-07-30T09:00:00Z",
        "updatedAt": "2025-08-01T15:00:00Z",
        "deletedAt": null
    },
    {
        "name": "Deniz Yakıt İkmal Operasyonu",
        "type": "Yakıt İkmal",
        "details": "Geminin deniz yakıtı ikmali yapılacak",
        "port": "Mersin Limanı",
        "customer": { "id": 7 },
        "users": [{ "id": 1 }, { "id": 3 }, { "id": 5 }],
        "ship": { "id": 15 },
        "operationLogs": [{ "id": 101 }, { "id": 102 }, { "id": 103 }],
        "startDate": "2025-06-10T12:00:00Z",
        "endDate": "2025-06-10T18:00:00Z",
        "status": "İptal Edildi",
        "cargoType": "Yakıt",
        "cargoDetails": "Dizel, 20000 litre",
        "createdAt": "2025-06-05T08:00:00Z",
        "updatedAt": "2025-06-09T17:00:00Z",
        "deletedAt": "2025-06-11T10:00:00Z"
    }
]


const operationlogs = [
    {
        "id": 10,
        "operation": { "id": 1 },
        "user": { "id": 2 },
        "log": "Operasyon başladı",
        "createdAt": "2025-07-20T08:00:00Z"
    },
    {
        "id": 11,
        "operation": { "id": 1 },
        "user": { "id": 7 },
        "log": "Operasyon tamamlandı",
        "createdAt": "2025-07-22T18:00:00Z"
    },
    {
        "id": 101,
        "operation": { "id": 2 },
        "user": { "id": 4 },
        "log": "Operasyon başladı",
        "createdAt": "2025-08-01T06:30:00Z"
    },
    {
        "id": 102,
        "operation": { "id": 2 },
        "user": { "id": 8 },
        "log": "Operasyon tamamlandı",
        "createdAt": "2025-08-01T14:00:00Z"
    },
    {
        "id": 103,
        "operation": { "id": 3 },
        "user": { "id": 1 },
        "log": "Operasyon başladı",
        "createdAt": "2025-06-10T12:00:00Z"
    },
    {
        "id": 104,
        "operation": { "id": 3 },
        "user": { "id": 15 },
        "log": "Operasyon tamamlandı",
        "createdAt": "2025-06-10T18:00:00Z"
    }
]


