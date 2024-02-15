// const handleScrape = async (searchValue) => {
//     try {
//         // Gọi API với phương thức POST
//         const response = await fetch('http://localhost:1337/api/crawl-data', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 // Các headers khác nếu cần thiết
//             },
//             body: JSON.stringify({
//                 searchValue: searchValue,
//                 // Thêm các thông tin khác vào body nếu cần
//             }),
//         });

//         // Kiểm tra trạng thái của response
//         if (response.ok) {
//             // Lấy nội dung của response và chuyển đổi sang JSON
//             const data = await response.json();
//             console.log('Data received from server:', data); // In ra dữ liệu nhận được từ server
//             console.log('Value of resultOut:', data.resultValue);

//             // Trích xuất pageTitle từ dữ liệu JSON nhận được
//             const resultOut = data.resultValue;

//             // Xử lý dữ liệu hoặc hiển thị thông báo thành công
//             const scrapeResultElement = document.getElementById('scrapeResult');
//             scrapeResultElement.textContent = `Resule trace: ${resultOut}`;


//             // Thực hiện các hành động khác với pageTitle nếu cần
//         } else {
//             // Xử lý lỗi hoặc hiển thị thông báo lỗi
//             console.error('API request failed');
//         }
//     } catch (error) {
//         // Xử lý lỗi nếu có
//         console.error('Error:', error);
//     }
// };
// export default handleScrape;

async function fetchDataForSelectedId(id) {
    try {
        const response = await fetch(`http://localhost:1337/api/anten-retus/${id}`);
        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu cho ID đã chọn:", error);
        return null;
    }
}
const sendPathsToServer = async (id, path1, path2, path3) => {
    try {
        // Gửi ID và các đường dẫn XPath qua server
        const response = await fetch('http://localhost:1337/api/crawl-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, path1, path2, path3 }), // Gửi ID và các đường dẫn XPath
        });
        console.log("Đã gửi ID và các đường dẫn XPath đến server thành công");

        if (response.ok) {
            const data = await response.json();
            const resultOutArray = data.resultScrape;
            // const scrapeResultElement = document.getElementById('scrapeResult');
            // scrapeResultElement.textContent = `Result out array: ${resultOutArray}`;
            return resultOutArray;
            // setIsTracing(false);
        } else {
            console.error('API request failed');
            return [];
            // setIsTracing(true);
        }
    } catch (error) {
        console.error("Lỗi khi gửi ID và các đường dẫn XPath qua server:", error);
        return [];
    }
}

const handleScrapeContent = async (selectedId, setResultOutArray) => {
    try {
        console.log("handleScrapeContent id:", selectedId);
        if (selectedId !== null) {
            const selectedData = await fetchDataForSelectedId(selectedId);
            if (selectedData !== null) {
                const { listenXPath1, listenXPath2, listenXPath3 } = selectedData.attributes.path;
                // Gửi ID và các đường dẫn XPath qua server
                const resultOutArray = await sendPathsToServer(selectedId, listenXPath1, listenXPath2, listenXPath3);
                console.log("Result out resultOutArray array in handleScrapeContent:", resultOutArray);
                setResultOutArray(resultOutArray); // Gọi setResultOutArray để cập nhật resultOutArray
            } else {
                console.error("handleScrapeContent Không thể tìm thấy dữ liệu cho ID đã chọn");
            }
        } else {
            console.error("Vui lòng chọn một ID trước khi thực hiện Trace");
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
export { fetchDataForSelectedId, handleScrapeContent, sendPathsToServer };




