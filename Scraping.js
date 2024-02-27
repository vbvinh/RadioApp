
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

const sendPathsToServer = async (id, ...args) => {
    try {
        // Gửi ID và các đường dẫn XPath qua server
        const response = await fetch('http://localhost:1337/api/crawl-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, paths: args }), // Gửi ID và các đường dẫn XPath
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
            console.log("handleScrapeContent selectedData:", selectedData);
            if (selectedData !== null) {
                // Khởi tạo mảng resultOutArray để chứa thông tin từ các selectedData
                let resultOutArray = [];

                // Truy cập vào thuộc tính path trong attributes
                const paths = selectedData.attributes.path;

                // Lặp qua các phần tử trong đối tượng paths và trích xuất thông tin
                Object.values(paths).forEach(path => {
                    const { name, clickXPath, resultXPath } = path;
                    resultOutArray.push({ name, clickXPath, resultXPath });
                });

                // Gửi resultOutArray qua server
                const response = await sendPathsToServer(selectedId, ...resultOutArray);
                console.log("Result out resultOutArray array in handleScrapeContent:", response);
                setResultOutArray(response); // Gọi setResultOutArray để cập nhật resultOutArray
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
