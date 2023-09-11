import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
// var arr = ["Devang","Vaishnav","Chitransh"]

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://devangvaishnav0703:Devang123@cluster0.bmp4zrl.mongodb.net/todoList');
  const todoListSchema = new mongoose.Schema({
    name: String
  });
  const ToDo = mongoose.model('todo', todoListSchema);

  const todo1 = new ToDo({
    name: "Peter"
  });

  const todo2 = new ToDo({
    name: "Sam"
  });

  const todo3 = new ToDo({
    name: "Jiya"
  });

  const workListSchema = new mongoose.Schema({
    name: String,
    workitem : [todoListSchema]
  });

  const Work = mongoose.model('work', workListSchema);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get('/',async (req,res) => {
    let item = await ToDo.find({});
    if(item.length === 0){
        ToDo.insertMany([todo1,todo2,todo3]).then(result => {
            console.log(result)
        });
        res.redirect("/");
    }
    else{
        res.render(__dirname + "/views/indexToday.ejs",{data:item, st:"Today"});
    }
});

app.get("/:customname", async (req,res) => {
    const nm = _.capitalize(req.params.customname);
    let ite = await Work.find({name : nm});
    
    if(ite.length === 0){
        const l1 = new Work({
            name : nm,
            workitem : [todo1,todo2,todo3]
        });

        l1.save();
        res.redirect(`/${nm}`);
    }else{
        // console.log(ite);
        // console.log(ite[0].workitem);
        res.render(__dirname + "/views/indexToday.ejs",{data:ite[0].workitem, st:nm});
    }
})

app.post('/update', async (req,res) => {

    const dyname = req.body.try;
    const nam = req.body.newToDo;
    const todon = new ToDo({
        name : nam
    });
    if(dyname === "Today"){
        todon.save();
        res.redirect("/");
    }else{
        let ite = await Work.find({name : dyname});
        ite[0].workitem.push(todon);
        ite[0].save();
        res.redirect("/"+dyname);
    }
});

app.post('/delete',async (req,res) => {
    const a = req.body.delst;
    const delid = req.body.check;
    // console.log(delid);
    if(a === "Today"){
        await ToDo.deleteOne({ _id :  delid});
        res.redirect("/");
    }else{
        let ite = await Work.find({name : a});
        // console.log(ite);
        // Work.findOneAndUpdate({name : a},{$pull : {workitem: {_id : delid}}});
        // Work.updateOne({ name : a }, {
        //     $pull: {
        //         workitem: {_id: delid},
        //     }
        // });

        await Work.updateOne( {name : a},
        {$pull:{workitem:{_id:delid}}});
        // console.log(delid);
        // ite[0].workitem.pull({ _id: delid });
        res.redirect("/"+a);
    }
});
// app.get('/work', (req,res) => {
//     res.render(__dirname + "/views/index.ejs");
// });

app.listen(port, (req,res) => {
    console.log("Our server is now running on port " + port + ".....");
});

}