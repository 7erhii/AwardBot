const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDate = () => {
  const today = new Date();
  const month = monthNames[today.getMonth()];
  const day = today.getDate();
  const year = today.getFullYear();
  return `${month} ${day}, ${year}`;
};

module.exports = {
  getDate: getDate
}

