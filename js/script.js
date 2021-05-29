///adding event listener for start/restart button
var initial_button=document.getElementById('mybtn');
initial_button.addEventListener('click',checkvalidity);

///checks validity of no_of_txn and no_of_items and if valid draw the table
function checkvalidity(){
    ///checking the current state
    var buttonelm=document.getElementById('mybtn');
    var curclass=buttonelm.classList.contains('start-btn');

    if(curclass==true){
        ///contains the start-btn class, so we are in the initial state
        ///if valid data, we will show the schedule table, will lock everything and make this button as restart button 

        var no_cols = document.getElementById('no_of_txn').value; 
        var no_variables = document.getElementById('no_of_items').value;
        
        var pat=/^\d+$/; ///integer pattern matching
        var flag=true;
        
        if(pat.test(no_cols)){
            document.getElementById('no_of_txn').classList.remove('is-invalid');
        }
        else{
            document.getElementById('no_of_txn').classList.add('is-invalid');
            flag=false;
        }

        var pat=/^\d+$/;
        if(pat.test(no_variables)){
            document.getElementById('no_of_items').classList.remove('is-invalid');
        }
        else{
            document.getElementById('no_of_items').classList.add('is-invalid');
            flag=false;
        }

        if(flag==true){
            ///all valid data
            document.getElementById('mybtn').innerText="Restart";
            buttonelm.classList.toggle('start-btn'); ///toggle will remove the start-btn class

            document.getElementById('no_of_txn').setAttribute('readOnly',"");
            document.getElementById('no_of_items').setAttribute('readOnly',"");

            createtable();
            document.getElementById('generatebtn').removeAttribute('disabled');
            document.getElementById('serialckbtn').removeAttribute('disabled');
        }
        else{
            ///we will do nothing and will for the next try of the user with valid data
        }
    }
    else{
        ///doesn't contain the start-btn class meaning we are in restart state, need to reinitialize everything and move to the start state
        document.getElementById('mybtn').innerText="Start";
        buttonelm.classList.toggle('start-btn'); ///toggle will add the start-btn class

        document.getElementById('no_of_txn').removeAttribute('readOnly');
        document.getElementById('no_of_txn').value="";
        document.getElementById('no_of_items').removeAttribute('readOnly');
        document.getElementById('no_of_items').value="";

        cleartable();
        cleargraph();
        document.getElementById('generatebtn').setAttribute('disabled',"");
        document.getElementById('serialckbtn').setAttribute('disabled',"");
    }
}

///will set the table headers and first row
function createtable(){
    var heading = document.getElementById('tbl-head');
    var no_cols = parseInt(document.getElementById('no_of_txn').value);

    ///drawing all the headings
    for (var i = 1; i <= no_cols; i++) {
        var thnode = document.createElement("th");
        thnode.innerText = "T" + i; ///will generate T1, T2, T3 etc. transaction numbers

        heading.appendChild(thnode);
    }
    var thnode = document.createElement('th'); ///extra heading colum for the delete operation
    heading.appendChild(thnode);

    ///drawing the first table row
    drawtablerow();

    ///enabling the addrowbtn
    document.getElementById('addrowbtn').classList.toggle("d-none"); ///removing the d-none class
}

///will clear the table
function cleartable(){
    var heading = document.getElementById('tbl-head');
    heading.innerHTML="";

    var body=document.getElementById('tbl-body');
    body.innerHTML="";

     ///disabling the addrowbtn
     document.getElementById('addrowbtn').classList.toggle('d-none'); ///adding the d-none class to hide the button
}

///adding event listener for add new row button click
var addrow_button=document.getElementById('addrowbtn');
addrow_button.addEventListener('click',drawtablerow);

///will create one table row within the schedule table
function drawtablerow() {
    var body = document.getElementById('tbl-body');

    var trnode = document.createElement("tr");
    var no_cols = parseInt(document.getElementById('no_of_txn').value);

    var no_options = parseInt(document.getElementById('no_of_items').value);

    for (var j = 0; j < no_cols; j++) {
        var tdnode = document.createElement("td");

        var options = document.createElement('select');
        options.classList.add('form-select');
        options.addEventListener('change', disableothers); ///when you change the option value then it will clear all the other transactions values, because 1 operation at a time
        
        var optionnode = document.createElement("option");
        optionnode.value = "-";
        optionnode.innerText = "";
        options.appendChild(optionnode);
        for (var i = 0; i < no_options; i++) {
            var optionnode1 = document.createElement("option");
            optionnode1.value = "R|" + String.fromCharCode(65 + i); ///value of the form: R|A, R|B, R|C etc.
            optionnode1.innerText = "Read(" + String.fromCharCode(65 + i) + ")";

            var optionnode2 = document.createElement("option");
            optionnode2.value = "W|" + String.fromCharCode(65 + i); ///value of the form: W|A, W|B, W|C etc.
            optionnode2.innerText = "Write(" + String.fromCharCode(65 + i) + ")";

            options.appendChild(optionnode1);
            options.appendChild(optionnode2);
        }

        tdnode.appendChild(options);

        trnode.appendChild(tdnode);
    }
    var delnode = document.createElement('td');
    delnode.innerHTML = "<input type='button' class='btn btn-outline-danger' value='X' onclick='delrow(event)'>";
    trnode.appendChild(delnode);

    body.appendChild(trnode);
}

///deleting row from the table
function delrow(e) {
    var trelm = e.target.parentNode.parentNode;
    var tableelm = document.getElementById('tbl-body');
    tableelm.removeChild(trelm);
}

///when one option is choosen, it will make sure all the other options gets reset
function disableothers(e) {
    var tdelm = e.target.parentNode;
    //console.log(tdelm);

    var trelm = tdelm.parentNode;
    //console.log(trelm);

    var trchild = trelm.childNodes;
    //console.log(trchild);
    for (var nd = 0; nd < trchild.length - 1; nd++) { ///-1 to ignore the last remove row button child
        var tdchild = trchild[nd];
        //console.log(tdchild);

        if (tdchild != tdelm) {
            //console.log(tdchild.childNodes);
            var selectchild = tdchild.childNodes[0]; ///first child node is the select element of every td
            //console.log(selectchild);

            selectchild.value = "-";
        }
    }
}

///adding event listener for generate button
var generate_btn=document.getElementById('generatebtn');
generate_btn.addEventListener('click',gen_adj_matrix);

///this will generate the schedule sequence
function gen_adj_matrix(){
    var seqlist=[]; ///array of sequential objects where each object is of the form {'id':0,'objname':'T1','op':'R','var':'A'}

    var no_cols=parseInt(document.getElementById('no_of_txn').value);

    var table_rows=document.querySelectorAll('#tbl-body tr');
    ///console.log(table_rows);
    for(var ind=0;ind<table_rows.length;ind++){
        ///within each table row element
        var currow=table_rows[ind];

        var childnodes=currow.childNodes;
        ///console.log(childnodes);

        for(var col=1;col<=no_cols;col++){
            var cell=childnodes[col-1]; ///index starts with 0
            ///console.log(cell);

            var opvalue=cell.childNodes[0].value; ///childnodes[0] is the select element
            ///console.log(opvalue);

            if(opvalue!='-'){
                var obj={
                    'id': col-1, ///for T1 id is 0, for T2 id is 1 etc.
                    'objname': 'T'+col,
                    'op': opvalue.split('|')[0], ///op=R|A will return R 
                    'var': opvalue.split('|')[1] ///op=R|A will return A
                }
                seqlist.push(obj); ///adding the object
            }
        }
    }

    console.log(seqlist); ///the sequence of transaction operations
    drawgraph(seqlist);
}

///color settings
var stateColor='#ffc299';
var borderandtextColor="#ff6600";
var labelbgColor='#fff0e6';
var stateSize=20;

function cleargraph(){
    ///reinitializing the graph-container
    document.getElementById('graph-container').innerHTML="";

    ///clearing the card content
    document.getElementById('cardcontent').innerHTML="";

    var myCollapse = document.getElementById('collapse-section');
    var bsCollapse = new bootstrap.Collapse(myCollapse,{
        toggle:false
    });
    bsCollapse.hide();
}

///sigma js drawing task
function drawgraph(seqlist){
    cleargraph();

    ///initializing the sigma graph
    var myGraph=new sigma.classes.graph();
    myGraph.read({
        nodes:[],
        edges:[]
    });

    ///initializing new sigma instance
    var s=new sigma({
        graph:myGraph,
        renderers: [
            {
                container: document.getElementById('graph-container'),
                type: 'canvas',
            }
        ],
        settings:{
            autoRescale: true,
            doubleClickEnabled: false, ///check whether the graph can be zoomed on double click
            enableCamera: true,
            enableEdgeHovering: true, ///the edges can be hovered to display special rendering and detial text
            edgeHoverExtremities: false, //////Indicates whether or not the edge's extremities (the nodes the edge connects) should be hovered with the edge.

            defaultLabelColor: borderandtextColor, // to change the label color
            defaultLabelSize: 16, // to change the label size
            defaultLabelHoverColor: borderandtextColor, // the default text color of hovered labels
            defaultHoverLabelBGColor: labelbgColor, // default background color of hovered nodes labels

            defaultNodeColor: stateColor, // to change the node color
            borderSize: 2, // the size of the border of hovered nodes
            defaultNodeBorderColor: 'transparent',

            defaultEdgeColor: borderandtextColor,
            edgeColor: 'default',
            maxEdgeSize: 4,
            defaultEdgeHoverColor: '#803300',
            edgeHoverColor: 'default',

            defaultEdgeLabelColor: borderandtextColor,
            defaultEdgeLabelSize: 20,
        }
    });

    // Initializing the dragNodes plugin:
    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

    dragListener.bind('startdrag', function(event) {
      console.log(event);
    });
    dragListener.bind('drag', function(event) {
      console.log(event);
    });
    dragListener.bind('drop', function(event) {
      console.log(event);
    });
    dragListener.bind('dragend', function(event) {
      console.log(event);
    });

    ///initializing number of nodes
    var no_cols=parseInt(document.getElementById('no_of_txn').value);
    for(var nd=1;nd<=no_cols;nd++){
        s.graph.addNode(
            {
                id:nd-1,
                label:'T'+nd,
                x:Math.random(),
                y:Math.random(),
                size:stateSize
            }
        );
    }
    console.log(myGraph.nodes());

    ///adj. matrix
    var adj_mat=[];
    for(var nd=0;nd<no_cols;nd++){
        adj_mat[nd]=[];
        for(var nd1=0;nd1<no_cols;nd1++){
            adj_mat[nd][nd1]=0;
        }
    }
    ///console.log(adj_mat);

    ///building the adjacency list
    for(var ind=0;ind<seqlist.length;ind++){
        var curobj=seqlist[ind];

        for(var ind1=ind+1;ind1<seqlist.length;ind1++){ ///searching next to the rest of the elements
            var restobj=seqlist[ind1];

            if(curobj.objname!=restobj.objname && curobj.var==restobj.var){
                if(curobj.op=='W' || restobj.op=='W'){
                    ///found a dependency
                    adj_mat[curobj.id][restobj.id]=1;
                }
            }
        }
    }
    console.log(adj_mat);

    var cnt=0;
    for(var ind=0;ind<no_cols;ind++){
        for(var ind1=0;ind1<no_cols;ind1++){
            if(adj_mat[ind][ind1]==1){
                var edgetype="arrow";
                if(adj_mat[ind1][ind]==1){ ///checking the reverse edge existance
                    edgetype="curvedArrow";
                }

                s.graph.addEdge({
                    id:'e'+cnt,
                    source:ind,
                    target:ind1,
                    size:3,
                    type:edgetype
                });
                cnt++;
            }
        }
    }
    console.log(myGraph.edges());

    s.refresh(); ///refreshing the sigma graph

    ///performing dfs to detect cycle and generate topological sort order
    var outcome=dfs(adj_mat, no_cols);
    if(outcome==false){
        document.getElementById('cardcontent').innerHTML="<h4 style='color:#ff4d4d;'>Not Serializable [Cycle Exists]</h4>";
        document.getElementById('cardcontent').innerHTML+="<div>Cycle: <code>"+cycle.reverse().join(' &rArr; ')+"</code></div>";

    }
    else{
        document.getElementById('cardcontent').innerHTML="<h4 style='color:#80ffff;'>Serializable Schedule</h4>";
        document.getElementById('cardcontent').innerHTML+="<div>Topological Order: <code>"+topological_order.reverse().join(' &rArr; ')+"</code></div>";
    }
}

var globaltime;
var ndlist;
var topological_order;
var cycle;

function dfs(adj_mat, no_cols){
    // initialization
    ndlist=[];
    topological_order=[];
    globaltime=0;
    cycle=[];

    for(var nd=0;nd<no_cols;nd++){
        ndlist.push({
            'color':'W',
            'parent':-1,
            'd':-1,
            'f':-1
        });
    }

    for(var ind=0;ind<no_cols;ind++){
        if(ndlist[ind].color=='W'){
            var res=dfs_visit(adj_mat, ind);
            if(res==false){
                return false;
            }
        }
    }

    return true;
}

function dfs_visit(adj_mat, ind){
    ndlist[ind].color="G";
    globaltime=globaltime+1;
    ndlist[ind].d=globaltime;

    var adj_list_row=adj_mat[ind];
    for(var adj_ind=0;adj_ind<adj_list_row.length;adj_ind++){
        if(adj_list_row[adj_ind]==1){
            if(ndlist[adj_ind].color=='W'){
                ///not visited node
                ndlist[adj_ind].parent=ind;
                var res=dfs_visit(adj_mat, adj_ind);
                if(res==false){
                    return false;
                }
            }
            else if(ndlist[adj_ind].color=="G"){
                ///gray to gray visit meaning cycle exists
                console.log("cycle exists");
                cycle.push('T'+(adj_ind+1));
                cycle.push('T'+(ind+1));
                var curnode=ndlist[ind].parent;

                while(curnode!=adj_ind){
                    cycle.push('T'+(curnode+1));
                    curnode=ndlist[curnode].parent;
                }
                cycle.push('T'+(curnode+1));

                console.log(cycle);
                return false;
            }
        }
    }

    ndlist[ind].color='B';
    globaltime=globaltime+1;
    ndlist[ind].f=globaltime;

    topological_order.push('T'+(ind+1));

    return true;
}
