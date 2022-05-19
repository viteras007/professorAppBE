const router = require("express").Router();
const Question = require("../models/Question");

router.post("/", async (req, res) => {
  const { ask,  type,  alternativeA,  alternativeB,  alternativeC,  alternativeD,  alternativeE,  answer,  level,  subject } = req.body;

  if (!ask ||  !type || !answer ||  !level ||  !subject) {
    return res.status(422).json({ error: "Missing fields" });
  }

  const question = {
    ask,
    type,
    alternativeA,
    alternativeB,
    alternativeC,
    alternativeD,
    alternativeE,
    answer,
    level,
    subject
  };

  try {
    await Question.create(question);

    res.status(201).json({ message: "Question created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/', async (req, res) => {
  const { ask, level, subject } = req.query;
  let filterOpc = null;
  if (ask) {
    const searchAsk = { $regex: ask, $options: "a"} ;
    filterOpc = { ...filterOpc, ask: searchAsk};
  }
  if (level) {
    filterOpc = {...filterOpc , level };
  }
  if (subject) {
    filterOpc = { ...filterOpc, subject };
  }

  try {
    const question = !filterOpc ? await Question.find() : await Question.find(filterOpc);
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.findOne({ _id: id });

    if(!question) {
      return res.status(422).json({message: "Question not found"});
    }

    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// router.patch('/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, salary, approved } = req.body;

//   const person = {
//     name,
//     salary,
//     approved
//   };

//   try {
//     const updatedPerson = await Person.updateOne({_id: id}, person);    
//     if (updatedPerson.matchedCount === 0) {
//       return res.status(422).json({ message: "Person not found" });
//     }

//     return res.status(200).json(person);
//   } catch (err) {
//     return res.status(500).json({ error: err });
//   }
// });

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const question = await Question.find({ _id: id });

  if (!question) {
    return res.status(422).json({ message: "Question not found" });
  }

  try{
    await Question.deleteOne({ _id: id });
    res.status(200).json({message: "Question deleted successfully"});
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
