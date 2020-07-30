import express from 'express';
const router = express.Router();
import { promises as fs, read } from 'fs';

const { readFile, writeFile } = fs;

global.fileName = 'grades.json'

const readGradesFile = async () => {
  return JSON.parse(await readFile(global.fileName));
}

router.post('/', async (req, res, next) =>{
  try{
    let grade = req.body;

    const data = await readGradesFile();

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date()
    }
    data.grades.push(grade);
    await writeFile(global.fileName, JSON.stringify(data, null, 2))

    res.send(grade)
    
  }catch(err){ next(err) }
})

router.put('/', async(req, res, next) => {
  try{
    let grade = req.body;
    const data = await readGradesFile();
    const index = data.grades.findIndex(x => x.id === grade.id );

    if(index === -1) {
      throw new Error('Grade not fond')
    }

    grade = {
      ...grade,
      tymestamp: new Date()
    }

    data.grades[index] = grade; 
  
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.send(grade)

  }catch(err){ next(err) }
})

router.delete('/:id', async(req, res, next ) => {
  try{
    const data = await readGradesFile();
    data.grades = data.grades.filter(grade => grade.id !== parseInt(req.params.id));

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(data)
  }catch(err){ next(err) }
})

router.get('/:id', async(req, res, next) => {
  try{
    const data = await readGradesFile();
    const grade = data.grades.find(grade => grade.id === parseInt(req.params.id));
    res.send(grade)
  }catch(err) { next(err) }
})

router.get('/:student/:subject', async(req, res, next) => {
  try{
    const data = await readGradesFile();
    const grade = data.grades.filter(grade => 
      grade.student === req.params.student && grade.subject === req.params.subject
    )
    const valueArray = grade.map(value => value.value)
    const sum = valueArray.reduce((a, b) => a + b)
    
    res.send(`The grade sum is ${sum}`)

  }catch(err){ next(err) }
})

router.get('/average/:subject/:type', async(req, res, next) => {
  try{
    const data = await readGradesFile();
    const gradeAverage = data.grades.filter(grade => 
      grade.subject === req.params.subject && grade.type === req.params.type
    )

    const valueArray = gradeAverage.map(value => value.value)
    const sum = valueArray.reduce((a, b) => a + b)
    const average = sum/valueArray.length
   
    res.send(`The average in the ${req.params.subject} ${req.params.type} = ${average}`)

  }catch(err){ next(err) }
})

router.get('/biggest/:subject/:type', async (req, res, next ) => {
  try{
    const data = await readGradesFile();
    const grade = data.grades.filter(grade => grade.subject === req.params.subject && grade.type === req.params.type )

    const sort = grade.sort((x, y) => y.value - x.value).slice(0,3)

    res.send(sort)
  }catch(err) { next(err) }
})

router.use((err, req, res, next) => {
  console.log(err)
  res.status(400).send({ error: err.message })
})


export default router