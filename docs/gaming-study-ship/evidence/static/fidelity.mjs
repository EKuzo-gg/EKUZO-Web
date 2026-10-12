import fs from 'fs';
const T=s=>fs.readFileSync(`docs/gaming-study-ship/evidence/static/text/${s}.txt`,'utf8').replace(/\s+/g,' ');
const post=T('gaming-study-13-7-years-younger-what-it-means-for-kids');
const link='the viral “13.7 years younger” gaming study';
const checks=[
['CP-1 C1 title (post)', 'gaming-study-13-7-years-younger-what-it-means-for-kids','The gaming study everyone shared, and what it means for your twelve-year-old'],
['CP-1 C1 title (/blog)', 'blog','The gaming study everyone shared, and what it means for your twelve-year-old'],
['CP-2 C3 short answer','gaming-study-13-7-years-younger-what-it-means-for-kids','Short answer: one study of 923 adults, average age 55, found that people who game three or more hours a week scored higher than non-gamers on memory, reasoning and processing-speed tests. It can\'t say the gaming caused that, and no one under 18 was in it, so it tells you nothing about your twelve-year-old. The “13.7 years younger” line came from a 2024 press release that counted gaming differently. I think the better question for a kid is what kind of gaming, and who he plays with.'],
['CP-3 C3b trimmed para','gaming-study-13-7-years-younger-what-it-means-for-kids','My first reaction was “duh.” My second, after I read the paper, was that the number everyone was repeating isn\'t in it. The replies were the interesting part.'],
['CP-4 C4 tennis','gaming-study-13-7-years-younger-what-it-means-for-kids','break me out of it: tennis, piano, orchestra. Nothing took.'],
['CP-5 C5 alt','gaming-study-13-7-years-younger-what-it-means-for-kids','[IMG alt: Same game, two different hours. Who\'s there: strangers in a public queue, or the same teammates every week. Who\'s watching: no adult on the call, or a coach on the call. When it ends: when someone says stop, or set before it starts. What it\'s for: the next win, or one thing to get better at. From the doorway, both look like screen time.]'],
['CP-8 C8 FAQ q','gaming-study-13-7-years-younger-what-it-means-for-kids','Is gaming good for kids\' brains? This study can\'t answer that; no one under 18 was in it.'],
['CP-9 C9 heading','gaming-study-13-7-years-younger-what-it-means-for-kids','What the study found, and what it didn\'t Not my specialty.'],
['CP-11 S1','gaming-study-13-7-years-younger-what-it-means-for-kids','I saw a recent post on X, probably the same way you did. A physician with a big following put up a study abstract and one sentence: frequent gamers performed on cognitive tests like non-gamers about 13.7 years younger. Counting the posts that quoted it, it passed 30 million views in its first week. For three days my feed argued about whether video games make you smart.'],
['CP-12 S2.1','what-your-kids-gaming-is-telling-you','If '+link+' is why you’re here, that number isn’t in the paper. I read about a thousand of the replies and wrote up what it means for a twelve-year-old.'],
['CP-12 S2.2','league-of-legends-youth-development','When '+link+' went around, the most-liked reply under the original post was “The kind of gaming probably matters as much as the hours,” which is this whole page in eleven words. The 13.7 isn’t in the paper. I wrote up what is, and what it means for your kid.'],
['CP-12 S2.3','should-you-ban-fortnite','Related: when '+link+' went around (the number isn’t in the paper, and the study was of adults), parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up.'],
['CP-12 S2.4','what-homeschool-parents-taught-us-about-gaming','This piece has a sibling. I ran the same read on about a thousand replies to '+link+'. That number isn’t in the paper. The replies sorted into camps there too.'],
['CP-12 S2.5','when-your-sons-only-friends-are-online','The same idea surfaced when '+link+' made the rounds (the number isn’t in the paper; Karlin, our founder, read about a thousand of the replies). The most-liked reply under the original post was “The kind of gaming probably matters as much as the hours.”'],
['CP-13 S3 hero alt','gaming-study-13-7-years-younger-what-it-means-for-kids','[IMG alt: A phone showing the X post that says gamers test “~13.7 years younger.” The number is underlined, and a taped note under it reads “not in the paper.” Sticky notes ask which games, how many hours, what age, better than sports. Karlin Oei in a headset.]'],
['CP-14 S4 sources','gaming-study-13-7-years-younger-what-it-means-for-kids','View counts: more than 30M across the original post and its quote-posts by September 15, 2026. Original post 17.2M as read October 11, 2026; the two largest quote-posts 5.8M and 7.9M, and about 33M across eight posts, as read October 6, 2026. Likes as shown at the time.'],
['CP-15 closing','gaming-study-13-7-years-younger-what-it-means-for-kids','That\'s the conversation worth having at your table this week.'],
['CP-19 SUBHEAD','gaming-study-13-7-years-younger-what-it-means-for-kids','A doctor posted one line about a study. More than 30 million people saw it. I read a thousand of the replies, and the one that mattered wasn’t about the study.'],
['CP-19 Brockie','gaming-study-13-7-years-younger-what-it-means-for-kids','@CraigBrockie, 1.1K likes when I read it on September 15'],
['CP-19 13.7 checklist','gaming-study-13-7-years-younger-what-it-means-for-kids','Dubious. “13.7 years younger.” It\'s from a 2024 press release with a different definition of “frequent”; the paper never converts to years. Do the math on the public data and it depends on the age you compare to: about 15 years at the sample\'s average age of 55, about 12 at 70, and over 20 at 40, where the study runs out of data.'],
['CP-19 reanalysis links','gaming-study-13-7-years-younger-what-it-means-for-kids','(The script and its output, if you want to check.)'],
['CP-19 C8 answer','gaming-study-13-7-years-younger-what-it-means-for-kids','The child studies I know of are cross-sectional and mixed: better scores on some tasks alongside higher attention-problem and depression measures in nine- and ten-year-olds, from a paper that was retracted and replaced in 2023 with the numbers intact and the framing changed. “Associated with,” every time.'],
];
let out=[];
for(const [id,slug,exp] of checks){
  const t=T(slug); const norm=exp.replace(/\s+/g,' ');
  const ok=t.includes(norm);
  out.push(`${ok?'MATCH':'DIFF '} ${id}`);
  if(!ok){ // find nearest: first 40 chars
    let k=0; while(k<norm.length && t.includes(norm.slice(0,k+1))) k++;
    out.push(`   expected: ${norm}`); out.push(`   longest matching prefix len ${k}; rendered continues: ${t.slice(t.indexOf(norm.slice(0,Math.max(k,1))), t.indexOf(norm.slice(0,Math.max(k,1)))+norm.length+40)}`);
  }
}
// whitespace bug scan
for(const s of ['gaming-study-13-7-years-younger-what-it-means-for-kids','what-your-kids-gaming-is-telling-you','league-of-legends-youth-development','should-you-ban-fortnite','what-homeschool-parents-taught-us-about-gaming','when-your-sons-only-friends-are-online','blog']){
  const raw=fs.readFileSync(`docs/gaming-study-ship/evidence/static/text/${s}.txt`,'utf8');
  const ds=raw.match(/ {2,}/g), sp=raw.match(/\S [,.;:!?](?=\s|$)/g);
  out.push(`WS ${s}: doubledSpaces=${ds?ds.length:0} spaceBeforePunct=${sp?JSON.stringify(sp.slice(0,5)):0}`);
}
fs.writeFileSync('docs/gaming-study-ship/evidence/static/copy-fidelity.txt',out.join('\n')+'\n');
console.log(out.join('\n'));
