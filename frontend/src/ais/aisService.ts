// export const getShipByMMSI = async (mmsi: string): Promise<any | null> => {
//     const response = await fetch('http://localhost:3000/api/ship/external/' + mmsi, {
//         headers: {
//             'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//         },
//     });

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return response.json();
// };


