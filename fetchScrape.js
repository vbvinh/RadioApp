import React, { useState, useEffect } from 'react';
import { ScrapeResultTable, handleScrapeContent } from '../Scrape/Scraping.js';
//import { ScrapeResultTable } from '../Scrape/Scraping.js';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
 
const SearchComponentSrape = ({ setResultOutArray })  => {
    const [searchValue, setSearchValue] = useState('');
    const [selectedId, setSelectedId] = useState(null); // State để lưu trữ ID đã chọn
    //const [resultOutArray, setResultOutArray] = useState(null); 
    const [isDisconnect, setIsDisconnect] = useState(false);
    const [content, setContent] = useState(''); // Thêm state để lưu trữ nội dung trang web
    const [isTracing, setIsTracing] = useState(false);
    const [opacity, setOpacity] = useState(true);
    const [data, setData] = useState([]); // State để lưu trữ dữ liệu từ API


    const idNameMapping = {
        1: "one",
        2: "two",
        4: "four",
        5: "fine",
        7: "seven",
        8: "eight",
        9: "nine",
    };

    const getNameFromId = (id) => {
        return idNameMapping[id] || "Will_define";
    };

    const getIdFromName = (name) => {
        const id = Object.keys(idNameMapping).find(key => idNameMapping[key] === name);
        return id ? parseInt(id) : null;
    };

    useEffect(() => {
        fetchDataAndDisplay();
    }, []);

    function fetchDataAndDisplay() {
        fetch('http://localhost:1337/api/anten-retus')
            .then(res => res.json())
            .then(({ data }) => {
                console.log('API data', data);
                setData(data); // Lưu trữ dữ liệu từ API vào state
            })
            .catch(error => console.error(error));
    }

    function displayData(data) {
        const userList = document.querySelector('#userListScrape');
        userList.innerHTML = ''; // Clear previous content

        data.forEach(item => {
            const id = item.id;
            const markup = `<li> ${item.name}</li>`; // Create markup for each item
            userList.insertAdjacentHTML('beforeend', markup);
        });
    }

    function handleItemClick(id) {
        setSelectedId(id); // Lưu trữ ID đã chọn
    }
    const handleTraceClick = () => {
        //console.log("handleTraceClick id:", selectedId);
        //console.log("handleTraceClick setResultOutArray:", setResultOutArray);
        if (selectedId !== null) {
            setIsTracing(true); // Set tracing state to true
            // Call the handleScrapeContent function passing the selected ID
            //handleScrapeContent(selectedId)
            // eslint-disable-next-line no-undef
            handleScrapeContent(selectedId, setResultOutArray)

                .then(() => setIsTracing(false)) // Set tracing state to false after completion
                .catch(error => {
                    console.error('Error:', error);
                    setIsTracing(false); // Set tracing state to false in case of error
                });
        } else {
            console.error("Vui lòng chọn một ID trước khi thực hiện Trace");
        }
    };

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a href="" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e); }}> {children} &#x25bc;
        </a>
    ));

    const CustomMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
            const [value, setValue] = useState('');

            return (
                <div
                    ref={ref}
                    style={style}
                    className={className}
                    aria-labelledby={labeledBy}
                >
                    <Form.Control
                        autoFocus
                        className="mx-3 my-2 w-auto"
                        placeholder="Type to filter..."
                        onChange={(e) => setValue(e.target.value)}
                        value={value}
                    />
                    <ul className="list-unstyled">
                        {React.Children.toArray(children).filter(
                            (child) =>
                                !value || child.props.children.toLowerCase().includes(value.toLowerCase()),
                        )}
                    </ul>
                </div>
            );
        },
    );

    return (
        <div>
            <h3 className="fs-4 mb-3">Chọn tham số cần tìm</h3>
            {/* <input type="text" id="searchInput" placeholder="Search param" value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="customInput"
            /> */}
            {/* <button onClick={handleScrapeContent} disabled={isTracing} className="trace-button" style={{ opacity: opacity ? '0.5' : '1' }}>
                {isTracing ? 'Tracing...' : 'Trace'}
            </button> */}

            <button onClick={handleTraceClick} disabled={isTracing} className="trace-button" style={{ opacity: opacity ? '0.5' : '1' }}>
                {isTracing ? 'Tracing...' : 'Trace'}
            </button>


            <Dropdown>
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                    Choice Trace
                </Dropdown.Toggle>

                <Dropdown.Menu as={CustomMenu}>
                    {data.map((item) => (
                        // <Dropdown.Item key={item.id} onClick={() => handleItemClick(item.id)}>
                        //     {item.id}

                        <Dropdown.Item key={item.id} eventKey={item.id} onClick={() => handleItemClick(item.id)}>
                            {getNameFromId(item.id)}

                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            {/* Hiển thị nội dung trang web */}
            <div dangerouslySetInnerHTML={{ __html: content }}></div>

            <ul id="userListScrape"></ul>
        </div>
    );
};

export default SearchComponentSrape;
