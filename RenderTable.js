import React, { useState, useEffect } from 'react';
import { handleScrapeContent, fetchDataForSelectedId } from "../Scrape/Scraping.js";
import Table from 'react-bootstrap/Table';
import SearchComponentSrape from '../Fetch/fetchScrape.js'; // Import SearchComponentSrape


const AppRenderTable = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [resultOutArray, setResultOutArray] = useState([]);
    const [firstRowBold, setFirstRowBold] = useState(true); // Biến trạng thái để in đậm hàng đầu tiên

    useEffect(() => {
        console.log('ScrapeResultTable component is being rendered after useEffect');
        const fetchDataAndSetResult = async () => {
            try {
                // Thực hiện gọi handleScrapeContent để lấy resultOutArray
                const resultArray = await handleScrapeContent(selectedId); // Thay đổi tham số nếu cần
                setResultOutArray(resultArray);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchDataAndSetResult(); // Gọi hàm fetchDataAndSetResult khi component được render
    }, [selectedId]); // useEffect sẽ chỉ chạy một lần sau khi component được render


    return (
        <div>
            {/* Sử dụng SearchComponentSrape và truyền hàm setResultOutArray xuống */}
            <SearchComponentSrape setResultOutArray={setResultOutArray} />
            <h3>Scrape Result</h3>
            <Table striped bordered hover>
                {/* <thead>
                    <tr>
                        <th>Index</th>
                        <th>Name</th>
                        <th>Value 1</th>
                        <th>Value 2</th>
                    </tr>
                </thead> */}
              <tbody>
                    {Array.isArray(resultOutArray) && resultOutArray.map((data, index) => (
                        <tr key={index} style={{ fontWeight: firstRowBold && index === 0 ? 'bold' : 'normal' }}>
                            <td>{index === 0 ? 'Index' : index}</td>
                            <td>{data.name}</td>
                            <td>{data.click}</td>
                            <td>{data.result}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

        </div>
    );
}

export default AppRenderTable;
