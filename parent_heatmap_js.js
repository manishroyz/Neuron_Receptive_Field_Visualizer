let ct_array = new Array();

function compute_ct(d){
    //console.log('-----------------------');
    let rf1pf1 = Math.sqrt(Math.pow((d.cell_id_x-fp1_x),2) +  Math.pow((d.cell_id_y-fp1_y),2));
    let rf1pf2 = Math.sqrt(Math.pow((d.cell_id_x-fp2_x),2) +  Math.pow((d.cell_id_y-fp2_y),2));
    //console.log('RF1FP1: '+ rf1pf1 + ' AND ' + 'RF1FP2: '+ rf1pf2);
    let ind = (rf1pf2 - rf1pf1)/(rf1pf1 + rf1pf2);
    //console.log('ind-->'+ind);
    // Setting saccade direction :
    let sacc;
    if (fp2_x < fp1_x){
        sacc = -1;
        //console.log('Left Saccade  sacc='+sacc);
    }
    else{
        sacc = 1;
        //console.log('Right Saccade  sacc='+sacc);
    }
    let hem;
    // setting hemifield value
    if (d.cell_id_x >= fp1_x){
        // RF of neuron is to the right of the FP1 and hence left hemisphere = -1 (Right Hemifield)
        // (= 0 for compuational purpose)
        hem = -1;
        //console.log('Right Hemifield   hem ='+hem);
    }
    else{
        hem = 1;
        //console.log('Left Hemifield   hem ='+hem);
    }
    let st_hem = sacc * hem;
    if (st_hem == -1){
        st_hem = 0;
    }
    //console.log('st_hem-->' + st_hem );
    // Computing ct using the developed model
    let x1 = 1/rf1pf1;
    let x2 = 1/rf1pf2;
    let x3 = ind;
    let x4 = st_hem;
    let x1x2 = x1 * x2;
    let x1x4 = x1 * x4;
    let x2x3 = x2 * x3;
    let x2x4 = x2 * x4;
    let x3x4 = x3 * x4;
    let x1x1 = x1 * x1;
    let x2x2 = x2 * x2;

    let temp_delay_mod = 5 + -51.7 * x1 - 11 * x2 + 3.6 * x3 -5 * x4 + 188 * x1x2
        -7.58 * x1x4 - 9.5 * x2x3 + 68 * x2x4 + 4.8 * x3x4 + 61 * x1x1 - 18 * x2x2;

    ct_array.push(temp_delay_mod);
    return temp_delay_mod;
}


// FP1 & FP2
let fp1_x = 0;
let fp1_y = 0;
let fp2_x = -10;
let fp2_y = 0;

// function assign_colors(d){
//     if (d.cell_id_x == fp1_x && d.cell_id_y == fp1_y) {
//         return "cell_rf1";
//     }
//     else if (d.cell_id_x == fp2_x && d.cell_id_y == fp2_y) {
//         return "cell_rf2";
//     }
//     else
//     {
//         return "cell_others";
//     }
// }


// create a tooltip
var Tooltip = d3.select("#grid_left")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")

function mouseover(d){
    //console.log('ct_array-->'+ct_array);
    let min = ct_array[0];
    let max = ct_array[0];
    for (i =0; i<ct_array.length; i++){
        if (ct_array[i]>max){
            max = ct_array[i];
        }
        if (ct_array[i]<min){
            min = ct_array[i];
        }
        //console.log(ct_array[i]);
    }
    //console.log('max-->'+max);
    //console.log('min-->'+min);

    d3.select(this).attr("class","cell_hover");
    Tooltip
        .style("opacity", 1)
}

function mousemove (d) {
    Tooltip
        .html("<b>(x,y) = (" + d.cell_id_x + ',' +d.cell_id_y + ') and  ct = '+ d.ct )
        .style("left", (d3.mouse(this)[0]+70) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
}

function mouseleave(d) {
    d3.select(this).attr("class", "cell");
    Tooltip
        .style("opacity", 0);
}



// Build color scale
var myColor = d3.scaleLinear()
    // .domain([-6,36])
    .range(["#C9FBFF", "#030A97"]);



// X --> columns
var x_range = 25;
// Y --> rows
var y_range = 7;

function gridData() {
    var data = new Array();
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;
    var width = 50;
    var height = 50;

    var click = false;
    var cell_cntr = 0;

    var x_mid = Math.ceil(x_range/2);
    var y_mid = Math.ceil(y_range/2);
    let ct = 88;

    // iterate for rows
    for (var row = 0; row < y_range; row++) {
        data.push( new Array() );
        // iterate for cells/columns inside rows
        for (var column = 0; column < x_range; column++) {
            cell_cntr +=1;
            data[row].push({
                x: xpos,
                y: ypos,
                cell_id_x : column + 1 - x_mid,
                cell_id_y : (row + 1 - y_mid)*(-1),
                width: width,
                height: height,
                click: click,
                ct : ct
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }
    return data;
}

var gridData = gridData();
console.log(gridData);

let svg_width = 50*(x_range+1);
let svg_height = 50*(y_range+1);



var grid = d3.select("#grid_left")
    .append("svg")
    .attr("id", "svg1")
    .attr("width",svg_width)
    .attr("height",svg_height);

var row = grid.selectAll(".row")
    .data(gridData)
    .enter().append("g")
    .attr("class", "row");

var column = row.selectAll(".square")
    .data(function(d) {
        // console.log('d--' ,d);
        return d; })
    .enter().append("rect")
    .attr("class","square")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("cell_id_x", function(d) { return d.cell_id_x; })
    .attr("cell_id_y", function(d) { return d.cell_id_y; })
    .attr("width", function(d) { return d.width; })
    .attr("height", function(d) { return d.height; })
    .attr("class", "cell")
    .attr("ct",function (d) {
        d.ct = compute_ct(d);
        //console.log('ct===='+d.ct);
        return d.ct;
    })
    .style("fill", function(d) {
        //console.log('location-->'+d.cell_id_x+', '+d.cell_id_y);
        //console.log('myColor--->'+myColor(d.ct));
        if (d.cell_id_x == fp1_x && d.cell_id_y == fp1_y){
            return "#E3D11E"
        }
        else if (d.cell_id_x == fp2_x && d.cell_id_y == fp2_y){
            return "#DA2E00"
        }
        else{
            return myColor(d.ct);
        }
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);