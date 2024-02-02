const handleScrape = async (searchValue) => {
    try {
        // Gọi API với phương thức POST
        const response = await fetch('http://localhost:1337/api/crawl-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Các headers khác nếu cần thiết
            },
            body: JSON.stringify({
                searchValue: searchValue,
                // Thêm các thông tin khác vào body nếu cần
            }),
        });

        // Kiểm tra trạng thái của response
        if (response.ok) {
            // Lấy nội dung của response và chuyển đổi sang JSON
            const data = await response.json();
            console.log('Data received from server:', data); // In ra dữ liệu nhận được từ server
            console.log('Value of resultOut:', data.resultValue);

            // Trích xuất pageTitle từ dữ liệu JSON nhận được
            const resultOut = data.resultValue;

            // Xử lý dữ liệu hoặc hiển thị thông báo thành công
            const scrapeResultElement = document.getElementById('scrapeResult');
            scrapeResultElement.textContent = `Resule trace: ${resultOut}`;


            // Thực hiện các hành động khác với pageTitle nếu cần
        } else {
            // Xử lý lỗi hoặc hiển thị thông báo lỗi
            console.error('API request failed');
        }
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error:', error);
    }
};

export default handleScrape;
