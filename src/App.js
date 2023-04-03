import React, { useState } from "react";
import "./App.css";
import MaterialTable from "material-table";
import GetAppIcon from "@material-ui/icons/GetApp";
import AddIcon from "@material-ui/icons/Add";

function App() {
  var xlsx = require("xlsx");
  const [tableData, setTableData] = useState([]);

  const columns = [
    {
      title: "Наименования",
      field: "name",
      sorting: false,
      filtering: false,
    },
    { title: "Магазин", field: "store", filterPlaceholder: "фильтр" },
    { title: "Склад", field: "stock", align: "center", grouping: false },
    {
      title: "Всего",
      field: "total",
      filterPlaceholder: "фильтр",
      editable: "never",
    },
    {
      title: "Всего в БД",
      field: "totalInDb",
      filterPlaceholder: "фильтр",
    },
    {
      title: "Остаток",
      field: "remaind",
      filterPlaceholder: "фильтр",
      editable: "never",
    },
  ];
  return (
    <div className="App">
      <h1 align="center">NAB-center</h1>
      <h4 align="center">CalcApp</h4>
      <MaterialTable
        columns={columns}
        data={tableData}
        editable={{
          onRowAdd: (newRow) =>
            new Promise((resolve, reject) => {
              // Calculate the total and remaind values
              const total = +newRow.store + +newRow.stock;
              const remaind = total - newRow.totalInDb;

              // Add the new row with calculated values to the tableData state
              setTableData([
                ...tableData,
                { ...newRow, total: total, remaind: remaind },
              ]);

              setTimeout(() => resolve(), 500);
            }),
          onRowUpdate: (newRow, oldRow) =>
            new Promise((resolve, reject) => {
              // Calculate the total and remaind values
              const total = +newRow.store + +newRow.stock;
              const remaind = total - newRow.totalInDb;

              // Update the row with the new values
              const updatedData = [...tableData];
              updatedData[oldRow.tableData.id] = {
                ...newRow,
                total: total,
                remaind: remaind,
              };
              setTableData(updatedData);
              setTimeout(() => resolve(), 500);
            }),
          onRowDelete: (selectedRow) =>
            new Promise((resolve, reject) => {
              const updatedData = [...tableData];
              updatedData.splice(selectedRow.tableData.id, 1);
              setTableData(updatedData);
              setTimeout(() => resolve(), 1000);
            }),
        }}
        actions={[
          {
            icon: () => <GetAppIcon />,
            tooltip: "Click me",
            onClick: (e, data) => console.log(data),
            // isFreeAction:true
          },
          {
            icon: "upload",
            tooltip: "Upload Excel file",
            onClick: (e, data) => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".xlsx, .xls, .csv";
              input.onchange = (event) => {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  const binaryString = event.target.result;
                  const workbook = xlsx.read(binaryString, { type: "binary" });
                  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                  const importedData = xlsx.utils.sheet_to_json(worksheet, {
                    header: 1,
                  });

                  // Extract the headers row and remove it from the imported data
                  const headers = importedData.shift();

                  // Map the imported data to an array of objects with the correct keys
                  const importedTableData = importedData.map((row) =>
                    Object.fromEntries(
                      row.map((cell, index) => {
                        // Replace the column names with their Russian equivalents
                        let headerName = headers[index];
                        if (headerName === "Наименования") {
                          headerName = "name";
                        } else if (headerName === "Всего в БД") {
                          headerName = "totalInDb";
                        }
                        return [headerName, cell];
                      })
                    )
                  );

                  // Calculate the total and remaind values for each row
                  const updatedTableData = importedTableData.map((row) => ({
                    ...row,
                    total: +row.store + +row.stock,
                    remaind: +row.store + +row.stock - +row.totalInDb,
                  }));

                  // Update the table data state with the imported and calculated data
                  setTableData(updatedTableData);
                };
                reader.readAsBinaryString(file);
              };
              input.click();
            },
            isFreeAction: true,
          },
        ]}
        onSelectionChange={(selectedRows) => console.log(selectedRows)}
        options={{
          sorting: true,
          search: true,
          searchFieldAlignment: "right",
          searchAutoFocus: true,
          searchFieldVariant: "standard",
          filtering: true,
          paging: true,
          pageSizeOptions: [2, 5, 10, 20, 25, 50, 100],
          pageSize: 5,
          paginationType: "stepped",
          showFirstLastPageButtons: false,
          paginationPosition: "both",
          exportButton: true,
          exportAllData: true,
          exportFileName: "TableData",
          exportDelimiter: ",",
          addRowPosition: "last",
          actionsColumnIndex: -1,
          selection: true,
          showSelectAllCheckbox: false,
          showTextRowsSelected: false,
          selectionProps: (rowData) => ({
            disabled: rowData.age == null,
            // color:"primary"
          }),
          grouping: true,
          columnsButton: true,
          rowStyle: (data, index) => {
            if (data.remaind < 0) {
              return { background: "#ffcccc" };
            } else if (index % 2 === 0) {
              return { background: "#f5f5f5" };
            } else {
              return null;
            }
          },
          headerStyle: { background: "#FFF200", color: "#000000" },
        }}
        title="AKB Information"
        icons={{ Add: () => <AddIcon /> }}
      />
      <h2>akb</h2>
    </div>
  );
}

export default App;
