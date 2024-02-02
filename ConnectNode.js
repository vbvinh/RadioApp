

const handleLoginWithIP = async (searchValue, setIsLoading, setContentCallback) => {
  setIsLoading(true); // Bắt đầu quá trình kết nối

  try {
    const regex = /\b192(?:\.\d{1,3}){3}\b/g;
    const matches = searchValue.match(regex);

    // Lấy kết quả IP
    const IP = matches ? matches[0] : null;
    if (IP) {
      setContentCallback(`<h3>${IP}</h3>`);
      await handleLogin(IP, setIsLoading);
    } else {
      setContentCallback("<p>IP not found.</p>");
      setIsLoading(false); // Kết thúc quá trình kết nối với trạng thái lỗi
    }
  } catch (error) {
    console.error(error);
    setIsLoading(false); // Kết thúc quá trình kết nối với trạng thái lỗi
  }
};

const handleLogin = async (IP, setIsLoading) => {
  try {
    console.log('IP view', IP);
    // Gọi API với phương thức POST
    const response = await fetch('http://localhost:1337/api/crawl-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Các headers khác nếu cần thiết
      },
      body: JSON.stringify({
        searchValue: IP,
        // Thêm các thông tin khác vào body nếu cần
      }),
    });

    // Kiểm tra trạng thái của response
    if (response.ok) {
      // Lấy nội dung của response và chuyển đổi sang JSON
      const data = await response.json();
      console.log('Data received from server:', data); // In ra dữ liệu nhận được từ server
      console.log('Value of nodeBText:', data.nodeB);

      // Trích xuất pageTitle từ dữ liệu JSON nhận được
      const pageTitle = data.pageTitle;
      const nodeBText = data.nodeB;

      // Xử lý dữ liệu hoặc hiển thị thông báo thành công
      const loginResultElement = document.getElementById('loginResult');
      loginResultElement.textContent = `Connected to: ${pageTitle} | nodeBText: ${nodeBText}`;

      setIsLoading(false); // Kết thúc quá trình kết nối thành công
    } else {
      console.error('API request failed');
      setIsLoading(false); // Kết thúc quá trình kết nối với trạng thái lỗi
    }
  } catch (error) {
    console.error('Error:', error);
    setIsLoading(false); // Kết thúc quá trình kết nối với trạng thái lỗi
  }
};

export { handleLoginWithIP, handleLogin };
