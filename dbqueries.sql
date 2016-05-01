CREATE FUNCTION getwells(text, text) RETURNS SETOF wells AS $$
    SELECT * FROM wells 
    WHERE acos(sin(cast($1 as double precision)) * sin(cast(lat as double precision)) + 
    cos(cast($1 as double precision)) * cos(cast(lat as double precision)) 
    * cos(cast(lon as double precision) - (cast($2 as double precision)))) * 6371 <= 10;
$$ LANGUAGE SQL;