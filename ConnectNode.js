
// // Sử dụng biểu thức chính quy để lọc IP
// const regex = /\b10(?:\.\d{1,3}){3}\b/g;
// const matches = searchValue.match(regex);

// // Lấy kết quả IP
// const IP = matches ? matches[0] : null;
// if (IP) {
//   // Nếu có IP, cập nhật nội dung với định dạng HTML
//   setContentCallback(`<h3>${IP}</h3>`);
// } else {
//   // Nếu không có IP, thay đổi nội dung sang đoạn văn bản khác
//   setContentCallback("<p>IP not found.</p>");
// }

const setContentCallback = (content) => {
  // Định nghĩa logic cho setContentCallback
};

const handleLoginWithIP = (searchValue) => {
  const regex = /\b10(?:\.\d{1,3}){3}\b/g;
  const matches = searchValue.match(regex);

  // Lấy kết quả IP
  const IP = matches ? matches[0] : null;
  if (IP) {
    // Nếu có IP, cập nhật nội dung với định dạng HTML
    setContentCallback(`<h3>${IP}</h3>`);
    // Gọi handleLogin với IP đã lọc
    handleLogin(IP);
  } else {
    // Nếu không có IP, thay đổi nội dung sang đoạn văn bản khác
    setContentCallback("<p>IP not found.</p>");
  }
};

const handleLogin = async (IP) => {
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

export { handleLoginWithIP, handleLogin };
