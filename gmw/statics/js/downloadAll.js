// https://www.npmjs.com/package/react-tabulator

const table = new Tabulator("#datTable", {
    // data:data,           //load row data from array
    layout: "fitColumns", // fit columns to width of table
    responsiveLayout: "hide", // hide columns that dont fit on the table
    tooltips: true, // show tool tips on cells
    addRowPos: "top", // when adding a new row, add it to the top of the table
    history: true, // allow undo and redo actions on the table
    pagination: "local", // paginate the data
    paginationSize: 10, // allow 7 rows per page of data
    movableColumns: true, // allow column order to be changed
    resizableRows: true, // allow row order to be changed
    columns: [
        // define the table columns
        {title: "user", field: "id", headerFilter: "input"},
        {title: "longitude", field: "y", headerFilter: "input"},
        {title: "latitude", field: "x", headerFilter: "input"},
        {title: "date", field: "dataDate", headerFilter: "number"},
        {title: "mine", field: "classNum", headerFilter: "number"},
        {title: "label", field: "className", headerFilter: "input"}
    ]
});

let dates = [];
const dl_data = {};

function fetchDataFor(date) {
    $.ajax({
        url: "/download-all",
        data: {date},
        success(tabledata) {
            dl_data[date] = tabledata;
            $(`option[value=${date}]`).prop("disabled", false);
            const so_far = dates.map(d => dl_data[d]);
            const notfetched = so_far.filter(x => !x).length;
            if (notfetched == 0) {
                dl_data.all = so_far.flat();
                $("option[value=all]").prop("disabled", false);
            }
        },
        error(err) {
            fetchDataFor(date);
        }
    });
}

$.ajax({
    url: "/get-data-dates",
    success(resp) {
        dates = resp.map(x => x.split("T")[0]);
        const options = dates.map(x => `<option value='${x}' disabled=true>${x}</option>`);
        $("#projectDate").html(
            `${
                "<option value=false selected='selected' disabled>Select Date</option>"
                + "<option value=all disabled>All Dates</option>"
            }${options.join("")}`
        );
        dates.map(date => fetchDataFor(date));
        $("#projectDate").on("change", e => {
            const date = e.target.value;
            table.clearData();
            table.setData(dl_data[date]);
            // $.ajax({
            // 		url:'/download-all',
            // 		data: {date:date},
            // 		success: function(tabledata){
            // 			// console.log(tabledata);
            // 			table.setData(tabledata)
            // 		}
            // });
        });
    }
});

// table.setData("/download-all")
// trigger download of data.csv file
$("#download-csv").click(() => {
    table.download("csv", "data.csv");
});

// trigger download of data.json file
$("#download-json").click(() => {
    table.download("json", "data.json");
});

function formatToGeoJson(data) {
    const fc = {
        type: "FeatureCollection",
        features: []
    };
    data.forEach(item => {
        fc.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [item.y, item.x]
            },
            properties: {
                user: item.id,
                date: item.dataDate,
                class: item.classNum,
                label: item.className
            }
        });
    });
    return fc;
}
