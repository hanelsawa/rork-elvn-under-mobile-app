/**
 * CSV to JSON Course Importer for Victoria Golf Courses
 * 
 * Usage:
 *   bun run scripts/importVicCourses.ts <path-to-csv>
 * 
 * CSV Format:
 *   club,course,suburb,tee,par1,par2,...,par18,y1,y2,...,y18,si1,si2,...,si18,slope
 * 
 * Example:
 *   "Royal Melbourne Golf Club","West Course","Black Rock","Championship",4,4,4,4,4,3,5,3,4,4,4,4,3,5,5,4,3,4,428,437,354,...,138
 * 
 * This script will:
 * - Parse the CSV
 * - Group by club+course
 * - Generate course IDs (slugified club name)
 * - Collect all tees for each course
 * - Write to data/vic_courses.json
 */

import * as fs from 'fs';
import * as path from 'path';

type TeePars = {
  name: string;
  par: number[];
  yardage?: number[];
  strokeIndex?: number[];
  slope?: number;
};

type VicCourse = {
  id: string;
  club: string;
  course: string;
  suburb: string;
  state: 'VIC';
  tees: TeePars[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseCSV(filePath: string): VicCourse[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const courses = new Map<string, VicCourse>();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    
    if (values.length < 58) {
      console.warn(`Line ${i + 1}: Not enough columns (${values.length}), skipping`);
      continue;
    }

    const [club, course, suburb, tee, ...rest] = values;
    
    const par = rest.slice(0, 18).map(Number);
    const yardage = rest.slice(18, 36).map(Number);
    const strokeIndex = rest.slice(36, 54).map(Number);
    const slope = rest[54] ? Number(rest[54]) : undefined;

    if (par.length !== 18) {
      console.warn(`Line ${i + 1}: Invalid par data (${par.length} holes), skipping`);
      continue;
    }

    const key = `${club}-${course}`;
    const id = slugify(club + (course !== club ? `-${course}` : ''));

    if (!courses.has(key)) {
      courses.set(key, {
        id,
        club,
        course,
        suburb,
        state: 'VIC',
        tees: [],
      });
    }

    const existingCourse = courses.get(key)!;
    existingCourse.tees.push({
      name: tee,
      par,
      yardage: yardage.length === 18 ? yardage : undefined,
      strokeIndex: strokeIndex.length === 18 ? strokeIndex : undefined,
      slope,
    });
  }

  return Array.from(courses.values());
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: bun run scripts/importVicCourses.ts <path-to-csv>');
    console.error('');
    console.error('CSV Format:');
    console.error('  club,course,suburb,tee,par1,...,par18,y1,...,y18,si1,...,si18,slope');
    console.error('');
    console.error('Example:');
    console.error('  "Royal Melbourne Golf Club","West Course","Black Rock","Championship",4,4,...,138');
    process.exit(1);
  }

  const csvPath = args[0];
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Parsing CSV: ${csvPath}`);
  const courses = parseCSV(csvPath);
  
  console.log(`\nParsed ${courses.length} courses:`);
  courses.forEach((course) => {
    console.log(`  - ${course.club} (${course.suburb}) - ${course.tees.length} tees`);
  });

  const outputPath = path.join(process.cwd(), 'data', 'vic_courses.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  fs.writeFileSync(outputPath, JSON.stringify(courses, null, 2));
  
  console.log(`\n✅ Courses written to: ${outputPath}`);
}

main();
