using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Mvc;
using sp_web_gui.Models;

namespace sp_web_gui.Controllers
{
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        [HttpGet]
        [Route("file")]
        async public Task<ActionResult> FileJSON()
        {
            var content = await System.IO.File.ReadAllTextAsync("Contents/example.xml");
            byte[] byteArray = Encoding.ASCII.GetBytes(content);
            var xs = new XmlSerializer(typeof(ScacchiPainterDatabase));
            var des = xs.Deserialize(new MemoryStream(byteArray));
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(des);
            await System.IO.File.WriteAllTextAsync("Contents/example.json", json);
            return Json(des);
        }

        private static string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        [HttpGet("[action]")]
        public IEnumerable<WeatherForecast> WeatherForecasts()
        {
            var rng = new Random();
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                DateFormatted = DateTime.Now.AddDays(index).ToString("d"),
                TemperatureC = rng.Next(-20, 55),
                Summary = Summaries[rng.Next(Summaries.Length)]
            });
        }

        public class WeatherForecast
        {
            public string DateFormatted { get; set; }
            public int TemperatureC { get; set; }
            public string Summary { get; set; }

            public int TemperatureF
            {
                get
                {
                    return 32 + (int)(TemperatureC / 0.5556);
                }
            }
        }
    }
}
