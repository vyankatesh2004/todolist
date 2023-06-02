const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://vyankatesh04:u1Qdo9zbdGtKgN1H@cluster0.m9msbdp.mongodb.net/todolistDB");

var itemsSchema = new mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",itemsSchema);

// const item1 = new Item({
//     name: "Hi!"
// });

// const item2 = new Item({
//     name: "What's in your mind?"
// });

const defaultItems = [];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){

// var options = {
//     weekday : "long",
//     day : "numeric",
//     month : "long"
// }

// var day = today.toLocaleDateString("en-US",options);

Item.find({})
    .then(foundItems=>{

        res.render("list",{ listTitle : "Today",itemList: foundItems});

        // if(foundItems.length === -1){
        //     Item.insertMany(defaultItems)
        //         .then(()=>{
        //             console.log("items inserted successfully.")
        //         })
        //         .catch((err)=>{
        //             console.error("Error inserting items:",err)
        //         });
        //     res.redirect("/");    
        // }
        // else{
        //     res.render("list",{ listTitle : "Today",itemList: foundItems});
        // }
    })
    .catch(err=>{
        console.log(err);
    })



});

app.get("/:customListName",(req,res)=>{
    let customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
        .then((foundItem)=>{
            if(!foundItem){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
        
            else{
                res.render("list",{listTitle: customListName, itemList: foundItem.items})
            }
        })
        .catch(err=>{
            console.log(err);
        })
        
});
    


app.post("/",function(req,res){

const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item({
    name: itemName
}) 

if(listName === "Today"){
    item.save();
    res.redirect("/");
}
else{
    List.findOne({name: listName})
        .then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
}


});

app.post("/delete",(req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.list;

    // Item.findByIdAndRemove(checkedItem)
    //     .catch(err=>{
    //         console.error(err);
    //     });
    //     res.redirect("/");

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .catch(err=>{
            console.error(err);
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})        
            .catch(err=>{
                console.log(err);
            });
        res.redirect("/"+listName);
    }

    
    
});

app.listen(3000,function(){
    console.log("server started on port 3000");	
});
