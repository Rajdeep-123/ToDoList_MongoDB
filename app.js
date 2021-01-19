const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect('mongodb://localhost/toDoListDB', { useNewUrlParser: true, useUnifiedTopology: true });

const todoListReglarSchema = new mongoose.Schema({
    name: String
});

const RegularData = mongoose.model("RegularData", todoListReglarSchema);



const rData_1 = new RegularData({
    name: "Welcome to your list"
});
const rData_2 = new RegularData({
    name: "You can add new items"
});
const rData_3 = new RegularData({
    name: "you can delete any item"
});

const rDataArry = [rData_1, rData_2, rData_3];

const newListSchema = new mongoose.Schema({
    name: String,
    items: [todoListReglarSchema]
});

const List = mongoose.model("List", newListSchema);


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {


    RegularData.find((err, arr) => {
        if (arr.length === 0) {
            RegularData.insertMany(rDataArry, function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Data has been stored succesfully!")
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", {
                thisDay: "Today",
                newItems: arr

            });
        }

    });

});

app.get("/:test", (req, res) => {

    const newListName = _.capitalize(req.params.test);

    List.findOne({ name: newListName }, (err, result) => {
        if (!err) {

            if (result === null) {
                console.log("no item has been found");
                const list = new List({
                    name: newListName,
                    items: rDataArry
                })
                list.save();
                res.redirect("/" + newListName);

            }
            else {
                res.render("list", {
                    thisDay: newListName,
                    newItems: result.items
                });
            }
        }
    });


});


app.get("/about", (req, res) => {
    res.render("about");
})

app.post("/", (req, res) => {
    var newListItem = req.body.listItem;
    const dataDB = new RegularData({
        name: newListItem
    });
    if (req.body.list === "Today") {

        dataDB.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: req.body.list }, (err, result) => {
            if (!err) {
                result.items.push(dataDB);
                result.save();
                res.redirect("/" + req.body.list);
            }
        });



    }

});

app.post("/lists/search", (req, res) => {
    const query = _.capitalize(req.body.search);
    //console.log(query);
    List.findOne({ name: query }, (err, arr) => {
        if (!err) {

            if (arr === null) {

                res.send("No data found!")
            } else {
                res.redirect("/" + arr.name);
            }

        }
    })
})

app.post("/lists/query",(req,res)=>{
   // res.send("received");
    const createdQuery = _.capitalize(req.body.create);
    console.log(createdQuery);

    List.insertMany({name: createdQuery},(err)=>{
        if(!err){
            console.log("one list has been updated!");
            res.redirect("/"+createdQuery);
        }
    })
});

app.post("/deletebyid",(req,res)=>{
    const tTask = req.body.delete;
    const titleTask = tTask.replace(/\s+/g, '');
    console.log(titleTask);

    if(titleTask === "Today"){
        res.send("Warning: Cannot delete the default task!");
    }
    else{
        List.findOneAndDelete({name:titleTask},(err)=>{
            if(!err){
                console.log("removed");
                res.redirect("/");
            }
        })
    }
})

app.post("/delete", (req, res) => {


    let id = req.body.checkBox;
    let HiddenName = req.body.check;
    let newHiddenName = HiddenName.replace(/\s+/g, '');// to remove extra space
    let newId = id.replace(/\s+/g, '');// to remove extra space

    if (newHiddenName === "Today") {
        RegularData.findByIdAndRemove(newId, (err) => {
            if (!err) {
                console.log("deleted!")
            }
        })
        res.redirect("/");

    } else {
        List.findOneAndUpdate({ name: newHiddenName }, { $pull: { items: { _id: newId } } }, (err, foundList) => {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect("/" + newHiddenName);
                //console.log("updated");
            }


        });


    }


});

app.listen(3000, () => {
    console.log("Server has been started and running successfull...");
});